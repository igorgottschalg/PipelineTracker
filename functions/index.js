"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const firestore = admin.firestore().collection("pipelines");

const checkAuth = req => {
    const auth = {login: "gottschalg", password: "clnadm9"};
    const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
    const [login, password] = Buffer.from(b64auth, "base64")
        .toString()
        .split(":");
    return (
        login && password && login === auth.login && password === auth.password
    );
};

const add = pipelineInfo => {
    const {project, pipeline, step, status, datetime, job, branch} = pipelineInfo;
    return firestore.doc(`${project}/${branch}/${datetime}`).set({
        job,
        step,
        pipeline,
        status,
        datetime
    });
};

const app = (request, response) => {
    if (!checkAuth(request)) {
        response.set("WWW-Authenticate", 'Basic realm="401"');
        response.status(401).send("Authentication required.");
    }
    add(request.query)
        .then(() => {
            return response.status(200).json(request.query);
        })
        .catch(e => {
            return response.status(500).json(e);
        });
};

exports.api = functions.https.onRequest(app);
