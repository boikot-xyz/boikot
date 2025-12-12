#!/usr/bin/env python3


def check(s):
    sl = s.lower()
    words = [
        "scandal",
        "fine",
        "law",
        "criminal",
        "ethic",
        "wage",
        "labor",
        "labour",
        "investiga",
        "racis",
        "sexis",
        "discrim",
        "face",
        "claim",
        "brib",
        "boycott",
        "sustain",
        "tax",
        "illega",
        "court",
        "union",
        "competit",
        "environ",
        "sex",
    ]
    return any(word in sl for word in words)


with open("./410headlines.txt") as f:
    headlines = f.read().split("\n")

with open("./ethics-headlines.txt") as f:
    ethics_headlines = f.read().split("\n")

ethics_count = len([ s for s in ethics_headlines if check(s) ])
normal_count = len([ s for s in headlines if check(s) ])

print( normal_count / len(headlines) )
print( ethics_count / len(ethics_headlines) )

print("\n".join([ s for s in headlines if check(s) ]))
