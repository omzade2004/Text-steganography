// Hide secret message
function hideMessage() {
  let coverText = document.getElementById("coverText").value.trim();
  let secretText = document.getElementById("secretText").value.trim();

  if (!coverText || !secretText) {
    alert("Enter both cover text and secret message!");
    return;
  }

  let words = coverText.split(' ');
  let secretLetters = secretText.split('');

  // Append secret letters to words
  for (let i = 0; i < secretLetters.length && i < words.length; i++) {
    words[i] = words[i] + secretLetters[i];
  }

  document.getElementById("encodedText").value = words.join(' ');
}

// Reveal secret message
function revealMessage() {
  let encodedText = document.getElementById("decodeInput").value.trim();
  let words = encodedText.split(' ');
  let secretMessage = '';

  for (let word of words) {
    secretMessage += word[word.length - 1];
  }

  document.getElementById("decodedOutput").innerText = "🔓 Secret Message: " + secretMessage;
}
