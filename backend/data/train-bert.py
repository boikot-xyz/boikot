#!/usr/bin/env python3
"""

from transformers import DistilBertTokenizerFast
from transformers import DistilBertModel, DistilBertConfig

with open("./410headlines.txt") as f:
    headlines = f.read().split("\n")

with open("./ethics-headlines.txt") as f:
    ethics_headlines = f.read().split("\n")

# Instantiate DistilBERT tokenizer...we use the Fast version to optimize runtime
tokenizer = DistilBertTokenizerFast.from_pretrained('distilbert-base-uncased')
model = DistilBertModel.from_pretrained("distilbert-base-uncased")

# train classifier to distinguish headlines from ethics_headlines

"""



from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import torch
from torch.utils.data import Dataset, random_split
from transformers import (
    DistilBertTokenizerFast,
    DistilBertConfig,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding,
    EvalPrediction,
    set_seed,
)

# --------------------------------------------------------------------------- #
# 1. Load data
# --------------------------------------------------------------------------- #
def load_headlines(file_path: str) -> List[str]:
    """Read a file that contains one headline per line."""
    return [line.strip() for line in Path(file_path).read_text().splitlines() if line.strip()]


normal_headlines = load_headlines("./410headlines.txt")
ethics_headlines = load_headlines("./ethics-headlines.txt")

# --------------------------------------------------------------------------- #
# 2. Create label‑led dataset
# --------------------------------------------------------------------------- #
# Label 0 = normal, 1 = ethics
examples = [
    {"text": txt, "label": 0} for txt in normal_headlines
] + [
    {"text": txt, "label": 1} for txt in ethics_headlines
]

# --------------------------------------------------------------------------- #
# 3. Tokenise
# --------------------------------------------------------------------------- #
tokenizer = DistilBertTokenizerFast.from_pretrained("distilbert-base-uncased")

def tokenize(batch: Dict) -> Dict:
    """Tokenise a batch of samples."""
    return tokenizer(
        batch["text"],
        padding="max_length",  # padding is handled later by data collator
        truncation=True,
        max_length=64,
    )


# --------------------------------------------------------------------------- #
# 4. Dataset wrapper
# --------------------------------------------------------------------------- #
class HeadlinesDataset(Dataset):
    def __init__(self, data: List[Dict]):
        self.data = data
        self.encodings = tokenizer(
            [item["text"] for item in data],
            truncation=True,
            padding=True,
            max_length=64,
        )
        self.labels = [item["label"] for item in data]

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx])
        return item


dataset = HeadlinesDataset(examples)

# --------------------------------------------------------------------------- #
# 5. Train/validation split
# --------------------------------------------------------------------------- #
set_seed(42)
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size
train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

# --------------------------------------------------------------------------- #
# 6. Model
# --------------------------------------------------------------------------- #
config = DistilBertConfig.from_pretrained("distilbert-base-uncased", num_labels=2)
model = AutoModelForSequenceClassification.from_pretrained(
    "distilbert-base-uncased", config=config
)

# --------------------------------------------------------------------------- #
# 7. Trainer helpers
# --------------------------------------------------------------------------- #
data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

def compute_metrics(p: EvalPrediction):
    """Compute accuracy (you can add more metrics if you wish)."""
    preds = np.argmax(p.predictions, axis=1)
    return {"accuracy": (preds == p.label_ids).mean()}

training_args = TrainingArguments(
    output_dir="./distilbert_headlines_classifier2",
    num_train_epochs=3,
    per_device_train_batch_size=32,
    per_device_eval_batch_size=64,
    learning_rate=2e-5,
    weight_decay=0.01,
    eval_strategy="epoch",
    save_strategy="epoch",
    logging_dir="./logs",
    logging_steps=10,
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
    no_cuda=True,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    tokenizer=tokenizer,
    data_collator=data_collator,
    compute_metrics=compute_metrics,
)

# --------------------------------------------------------------------------- #
# 8. Train
# --------------------------------------------------------------------------- #
trainer.train()

# --------------------------------------------------------------------------- #
# 9. Evaluate
# --------------------------------------------------------------------------- #
metrics = trainer.evaluate()
print("\nFinal evaluation metrics:", metrics)

# --------------------------------------------------------------------------- #
# 10. Save the model for future inference
# --------------------------------------------------------------------------- #
trainer.save_model("./distilbert_headlines_classifier2")
tokenizer.save_pretrained("./distilbert_headlines_classifier2")

# --------------------------------------------------------------------------- #
# 11. Quick demo – run inference on a single headline
# --------------------------------------------------------------------------- #
def predict(text: str) -> Tuple[int, float]:
    """Return predicted label and confidence."""
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=64)
    with torch.no_grad():
        logits = model(**inputs).logits
    probs = torch.nn.functional.softmax(logits, dim=-1)[0]
    pred_label = int(torch.argmax(probs))
    confidence = float(probs[pred_label])
    return pred_label, confidence


sample = "Ethics in AI: A Call for Responsible Innovation"
pred, conf = predict(sample)
print(f"\nPrediction for '{sample}': label={pred} (confidence={conf:.3f})")
