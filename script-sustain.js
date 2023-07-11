import * as buffer from "https://cdn.skypack.dev/buffer@6.0.3";
const midi = new Midi();
const NoteSequence = protobuf.NoteSequence;

window.player = document.getElementById('myPlayer');
window.visualizer = document.getElementById('myVisualizer');
visualizer.config = {minPitch: 0, maxPitch: 127};

function addTrackToSequence(ns, instrument, notes) {
  for (const noteParams of notes) {
    const note = new NoteSequence.Note({
      pitch: noteParams[0],
      instrument,
      velocity: noteParams[1],
      startTime: noteParams[2],
      endTime: noteParams[3]
    });
    ns.notes.push(note);
    if (ns.totalTime < note.endTime) {
      ns.totalTime = note.endTime;
    }
  }
}

function addControlChangesToSequence(ns, instrument, controlChanges) {
for (const ccParams of controlChanges) {
  const cc = NoteSequence.ControlChange.create({
    time: ccParams[0],
    controlNumber: ccParams[1],
    controlValue: ccParams[2],
    instrument
  });
  ns.controlChanges.push(cc);
}
}

const ns = NoteSequence.create();

ns.tempos.push(NoteSequence.Tempo.create({qpm: 60, time: 0}));

ns.timeSignatures.push(NoteSequence.TimeSignature.create({
  time: 0,
  numerator: 4,
  denominator: 4,
}));


addTrackToSequence(ns, 0, [
  [60, 100, 1.0, 2.0],
  [61, 100, 2.0, 3.0],
  [62, 100, 3.0, 4.0],
  [64, 100, 5.0, 6.0],
  [65, 100, 6.0, 7.0]
]);
addControlChangesToSequence(ns, 0, [
   [0.0, 64, 127],
   [5.0, 64, 0]
]);

const sustainedNS = core.sequences.applySustainControlChanges(ns);
window.ns = ns

player.noteSequence = sustainedNS;
visualizer.noteSequence = sustainedNS;