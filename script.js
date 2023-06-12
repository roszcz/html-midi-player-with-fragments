import * as midiFile from "https://cdn.skypack.dev/midi-file@1.2.4";
import * as buffer from "https://cdn.skypack.dev/buffer@6.0.3";

const parseMidi = midiFile.parseMidi;
const writeMidi = midiFile.writeMidi;

window.player = document.getElementById('myPlayer');
window.visualizer = document.getElementById('myVisualizer');

window.fragmentInput = document.getElementById('fragment');
window.phraseInput = document.getElementById('phrase');
window.loadbutton = document.getElementById('loadbutton');
window.datastatus = document.getElementById('datastatus');

// player.src = 'https://assets.codepen.io/6275315/jagoda.mid';
// visualizer.src = 'https://assets.codepen.io/6275315/jagoda.mid';

async function readMidiFileFromURL(url) {
  console.log("reading file");
  try {
    window.response = await fetch(url);
    window.blob = await response.blob();
    window.outputSequence = await core.blobToNoteSequence(blob);
    
    player.noteSequence = outputSequence;
    visualizer.noteSequence = outputSequence;
  } catch (error) {
    console.log("error", error)
  }

}

// readMidiFileFromURL("https://assets.codepen.io/6275315/jagoda.mid");

async function fragmentMidiFileFromURL(url) {
  console.log("reading file");
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    window.midiFileBuffer = buffer.Buffer.from(arrayBuffer);
    
    window.parsed = parseMidi(midiFileBuffer);
    window.fragment = parseMidi(midiFileBuffer);
    
    fragment.tracks[0] = parsed.tracks[0].slice(0,200);
        
    window.output = writeMidi(fragment);
    window.outputBuffer = buffer.Buffer.from(output);
    window.outputBlob = new Blob([outputBuffer]);
    
    window.outputSequence = await core.blobToNoteSequence(outputBlob);
    
    player.noteSequence = outputSequence;
    visualizer.noteSequence = outputSequence;
  } catch (error) {
    console.log("error", error)
  }
}

function loadFragmentIndex(fragmentIndex, phraseIndex) {
  console.log("load fragments", fragmentIndex, phraseIndex)
  var phrase = data.fragments[fragmentIndex][phraseIndex];
  loadMidiFragment(phrase.start_note_index, phrase.end_note_index)
}

async function loadMidiFragment(start, end) {
    window.parsed = parseMidi(midiFileBuffer);
    window.fragment = parseMidi(midiFileBuffer);
    
    fragment.tracks[0] = parsed.tracks[0].slice(start,end);
        
    window.output = writeMidi(fragment);
    window.outputBuffer = buffer.Buffer.from(output);
    window.outputBlob = new Blob([outputBuffer]);
    
    // window.outputSequence = await core.blobToNoteSequence(outputBlob);
    window.outputSequence = await core.blobToNoteSequence(outputBlob);
    
    player.noteSequence = outputSequence;
    visualizer.noteSequence = outputSequence;  
}

fragmentMidiFileFromURL("https://assets.codepen.io/6275315/jagoda.mid");

window.loadFragmentIndex = loadFragmentIndex;
window.loadMidiFragment = loadMidiFragment;

const response = await fetch("https://assets.codepen.io/6275315/data-2.json");
const data = await response.json();
window.data = data;

function updateDataStatus(fragmentIndex) {
  datastatus.innerText = `Fragments: 0 - ${data.fragments.length - 1}
Fragment[${fragmentIndex}]: 0 - ${data.fragments[fragmentIndex].length - 1}`;
}


// fragment = data.fragments[0]
// phrase = fragment[0]

// loadMidiFragment(phrase.start_note_index, phrase.end_note_index)

// loadFragmentIndex(0,0);
updateDataStatus(0);

loadbutton.addEventListener("click", function () {
  loadFragmentIndex(fragmentInput.value, phraseInput.value);
  updateDataStatus(fragmentInput.value);
})