// This file contains extra JavaScript required only for the alt formats
// implementation, and not based on the standard oucontent.js.

if (window.addEventListener !== undefined) {
    window.addEventListener('load', function() {
        altFormatsInitFreeResponses();
    });
}

function altFormatsInitFreeResponses() {
    // These are only supported if window.localStorage is available. For some
    // reason it throws an error in IE if we test it the normal way, so test
    // a different way instead.
    try {
        var storage = window.localStorage;
        storage.setItem('localstoragetest', 'localstoragetest');
        storage.removeItem('localstoragetest');
    } catch (e) {
        if (window.console) {
            console.log('Local storage not supported');
        }
        return;
    }
    var textareas = document.getElementsByTagName('textarea');
    for (var i = 0; i < textareas.length; i++) {
        if (textareas[i].parentNode.className === 'altformats-freeresponse') {
            altFormatsInitFreeResponse(textareas[i].parentNode.id);
        }
    }
}

function altFormatsInitFreeResponse(id) {
    // Make it visible and get rid of the unsupported warning.
    var wrapper = document.getElementById(id);
    wrapper.style.display='block';
    var unsupported = document.getElementById(id + '-unsupported');
    unsupported.parentNode.removeChild(unsupported);

    // Get the components.
    var textarea = document.getElementById(id + '-textarea');
    var save = document.getElementById(id + '-save');
    var reset = document.getElementById(id + '-reset');

    // Get initial value.
    var initialValue = textarea.value;

    // Default buttons.
    save.disabled = true;
    reset.disabled = true;

    // Local storage key.
    var key = 'freeresponse-' + id;

    // Is there an associated answer/discussion? Or perhaps both?
    var answers = [];
    for (var nextNode = wrapper.nextSibling; nextNode; nextNode = nextNode.nextSibling) {
        if (nextNode.nodeName.toLowerCase() !== 'div') {
            continue;
        }
        var finishLoop = false;
        switch (nextNode.className) {
            case 'oucontent-saq-answer-fr' :
            case 'oucontent-saq-discussion-fr' :
                answers.push(nextNode);
                break;
            default:
                finishLoop = true;
                break;
        }
        if (finishLoop) {
            break;
        }
    }

    // Function to reveal the answers.
    var revealAnswers = function(show) {
        for (var i = 0; i < answers.length; i++) {
            answers[i].style.display = show ? 'block' : 'none';
        }
    };
    revealAnswers(false);

    // See if the user has a stored value.
    var stored = localStorage.getItem(key);
    if (stored !== null) {
        // Store user's value.
        textarea.value = stored;

        // They can reset it now.
        reset.disabled = false;

        // If they already saved something, show the answer.
        revealAnswers(true);
    }
    
    // Remember the last saved value.
    var lastSaved = textarea.value;

    // Add listeners for buttons and textarea.
    save.addEventListener('click', function() {
        // Is it the same as the initial value?
        var current = textarea.value;
        if (current === initialValue) {
            localStorage.removeItem(key);
            reset.disabled = true; 
        } else {
            localStorage.setItem(key, current);
        }
        lastSaved = current;
        save.disabled = true;

        // When they save something, show the answer.
        revealAnswers(true);
    });
    reset.addEventListener('click', function() {
        // Is it the same as the initial value?
        textarea.value = initialValue;
        reset.disabled = true;
        localStorage.removeItem(key);
        lastSaved = initialValue;
        save.disabled = true;

        // Let's hide the answers too.
        revealAnswers(false);
    });
    textarea.addEventListener('input', function() {
        var current = textarea.value;
        reset.disabled = current === initialValue;
        save.disabled = current === lastSaved;
    });
}
