import React from "react";

import { getKey, formatDateString, Badge, Card, FlexRow, Icon, IconButton, Page, PillButton, Row, Stack, TagBadge, ForceWrap, PillPopper } from "./components.jsx";
import publicComments from "../../comments.json";


const localComments = {
    "companies": {
        "barclays": {
            "comments": [
                {
                    "username": "oscar",
                    "commentText": "I have heard of barclays putting predatory fines on people in overdraft too 😠 taking advantage of them when they are stuggling",
                    "createdAt": "2025-10-30T12:09:30.315Z"
                },
                {
                    "username": "oscar",
                    "commentText": "I have heard of barclays putting predatory fines on people in overdraft too 😠 taking advantage of them when they are stuggling",
                    "createdAt": "2025-10-31T12:09:30.315Z"
                }
            ]
        },
        "hsbc": {
            "comments": [
                {
                    "username": "oscar",
                    "commentText": "I have heard of hsbc putting predatory fines on people in overdraft too 😠 taking advantage of them when they are stuggling",
                    "createdAt": "2025-10-30T12:09:30.315Z"
                }
            ]
        }
    }
};
const allComments = publicComments;

for( const [ key, entry ] of Object.entries(localComments.companies) ) {
    if( allComments.companies[key] ) {
        allComments.companies[key].comments = [...allComments.companies[key].comments, ...entry.comments];
    }
    else {
        allComments.companies[key] = entry;
    }
    allComments.companies[key].comments = allComments.companies[key]?.comments?.filter(
        (comment, index, self) =>
            index === self.findIndex((other) => (
                other.createdAt === comment.createdAt && other.commentText === comment.commentText
            ))
    );
}
implement local saving on submit


function NewComment({ entry, setAddingComment }) {
    const [ username, setUsername ] = React.useState("anonymous");
    const [ commentText, setCommentText ] = React.useState("anonymous");
    const createdAt = (new Date()).toISOString();

    return <form name="new-comment" method="post">
        <Stack gap="0.5rem" style={{ margin: "0.5rem 0" }}>
            <input type="hidden" name="form-name" value="new-comment" />
            <input type="hidden" name="createdAt" value={ createdAt } />
            <Row style={{ width: "100%", justifySelf: "stretch", gridTemplateColumns: "max-content 1fr", gap: "0.5rem" }}>
                <p> Username: </p>
                <input
                    autoFocus name="username" placeholder="Enter your name"
                    value={username} onChange={e => setUsername(e.target.value)}
                    style={{ border: "none", background: "#fff1", fontSize: "1rem", minWidth: 0 }} />
            </Row>
            <textarea
                name="commentText" placeholder="Enter your comment"
                style={{ border: "none", height: "6rem", background: "#fff1", fontWeight: 200 }} />
            <p style={{ fontSize: "0.8rem", textAlign: "justify" }}>
                ℹ️  Only the username and comment text you provide above will be stored!
                By clicking submit, you agree to let boikot store the provided username
                and comment, and make these publicly accessible. </p>
            <FlexRow style={{ justifySelf: "end", marginTop: "0.5rem" }}>
                <PillButton $outline onClick={e => e.preventDefault() + setAddingComment(false)}>❌  Cancel</PillButton>
                <PillButton type="submit">✅  Submit</PillButton>
            </FlexRow>
        </Stack>
    </form>;
}

function ExistingComment({ comment }) {
    return <Card style={{ borderColor: "white", background: "#fff1" }}>
        <Stack gap="0.4rem">
            <Row gap="0.5rem" style={{ alignItems: "end" }}>
                <h3> { comment.username } </h3>
                <p> · </p>
                <p style={{ opacity: 0.8, fontSize: "0.9rem" }}> { formatDateString(comment.createdAt) } </p>
            </Row>
            <p style={{ fontWeight: "200" }}> { comment.commentText } </p>
        </Stack>
    </Card>;
}

export function Comments({ entry }) {
    const entryComments = allComments.companies[getKey(entry)]?.comments || [];

    const [ addingComment, setAddingComment ] = React.useState(false);

    return <Stack style={{ marginTop: "2rem" }}>
        <Row style={{ width: "100%", justifySelf: "stretch", gridTemplateColumns: "max-content 1fr max-content" }}>
            <p> {entryComments.length} Comment{entryComments.length === 1 ? "" : "s"} </p>
            <hr />
            <PillButton $outline $small onClick={ () => setAddingComment(!addingComment) }>💭  Add a Comment!</PillButton>
        </Row>
        { addingComment && <NewComment entry={entry} setAddingComment={setAddingComment} /> }
        { entryComments.map( entryComment => <ExistingComment comment={entryComment} /> ) }
    </Stack>;
}
