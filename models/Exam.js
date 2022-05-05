const mongoose = require("mongoose")

const ExamSchema = new mongoose.Schema({
    patientID: {
        type: String,
        required: true
    },
    visitReason: {
        type: String,
    },
    familyHistory: {
        type: String,
    },
    generalHealth: {
        type: String,
    },
    medication: {
        type: String,
    },
    patientDrives: {
        type: Boolean,
    },
    patientUsesVDU: {
        type: Boolean,
    },
    occupation: {
        type: String,
    },
    ocularHistory: {
        type: String,
    },
    dateOfVisit: {
        type: Date,
        required: true
    },
    performingOptometrist: {
        type: String,
        required: true
    },
    author: {
        type: String, //person writing up the exam
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    //exam
    lensOpacityLeft: {
        type: String,
    },
    lensOpacityRight: {
        type: String,
    },
    lensComment: {
        type: String,
    },
    vitreousLeft: {
        type: String,
    },
    vitreousRight: {
        type: String,
    },
    viterousComment: {
        type: String,
    },
    discLeft: {
        type: String, //flat, 0.1 to 0.95 inclusive in increments of 0.05, “completely cupped” 
    },
    discRight: {
        type: String, //flat, 0.1 to 0.95 inclusive in increments of 0.05, “completely cupped” 
    },
    discComment: {
        type: String,
    },
    fundusLeft: {
        type: String, //normal reflex, drusen, pigment, oedema, other CUSTOM
    },
    fundusRight: {
        type: String, //normal reflex, drusen, pigment, oedema, other CUSTOM
    },
    maculaLeft: {
        type: String, //normal reflex, drusen, pigment, oedema, other CUSTOM
    },
    maculaRight: {
        type: String, //normal reflex, drusen, pigment, oedema, other CUSTOM
    },
    pupils: {
        type: String, //Normal and reflective [yes/no, if no:] R RAPD or L RAPD, R>L or L>R. 
    },
    pupilsComment: {
        type: String,
    },
    IOPLeft: {
        type: String, //in mmHg 9-50
    },
    IOPRight: {
        type: String, //in mmHg 9-50
    },
    IOPComment: {
        type: String, //time taken, contact
    },
    visualFieldLeft: {
        type: String, //full or defect
    },
    visualFieldRight: {
        type: String, //full or defect
    },
    visualFieldComment: {
        type: String,
    },
    fixationDisparity: {
        type: String, //XOP, SOP, XOT R or L, SOT R or L, orthophoric [normal]
    },
    motility: {
        type: String, //full and smooth or other
    },
    convergence: {
        type: String, //0-20cm in 1cm increments
    },
    stereopsis: {
        type: String, //seconds of arc
    },
    visualAcuity: {
        type: String,
        //Can detect hand movement? Can count fingers? 6/60, 6/36, 6/24, 6/18, 6/12, 6/9, 6/7.5, 6/6, 6/5, 6/4. With option to +/- 1 or 2
    },
    //prescription
    sphereLeft: {
        type: String, //Plano, or +/- 0.25 to 25.00 in 0.25 steps
    },
    sphereRight: {
        type: String, //Plano, or +/- 0.25 to 25.00 in 0.25 steps
    },
    cylinderLeft: {
        type: String, //-0.25 to -10.00 in 0.25 steps
    },
    cylinderRight: {
        type: String, //-0.25 to -10.00 in 0.25 steps
    },
    axisLeft: {
        type: String, //0° to 180°
    },
    axisRight: {
        type: String, //0° to 180°
    },
    prismBaseLeft: {
        type: String, //up, down, left, right, or a combination
    },
    prismBaseRight: {
        type: String, //up, down, left, right, or a combination
    },
    adviceGiven: {
        type: String, //New prescription/no change/no prescription needed/Referral (where to)
    },
    recallCode: {
        type: String, //(1, 2, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 5.3, 6) 
    },
    attachments: {
        type: Array,
        default: []
    },
})

const Exam = mongoose.model("Exam", ExamSchema)

module.exports = Exam