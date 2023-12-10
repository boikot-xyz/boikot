#!/usr/bin/env python3

import json, uuid


def new_entry():
    return {
        "names": [
            "NAME"
        ],
        "comment": "COMMENT",
        "sources": {
            "1": "SOURCE"
        },
        "score": 0,
        "ownedBy": None,
    }


def new_row():
    with open("boikot.json", "r") as json_file:
        rows = json.load(json_file)

    rows[ str(uuid.uuid4()) ] = new_entry()

    with open("boikot.json", "w") as json_file:
        json.dump(rows, json_file, indent=2)
    

new_row()

