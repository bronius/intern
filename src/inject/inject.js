function checkForEditBar() {
  var cS = document.querySelector('.clone_story'),
      templateBtn = document.createElement('button'),
      coffeeBtn = document.createElement('button'),
      ed = document.querySelector('.edit .controls');

  if (!ed) { return; }
  if ($(ed).find('.story_template').length) { return; }
  if ($(ed).find('.coffee_action').length) { return; }

  ed.style.width = '332px';
  templateBtn.className = 'left_endcap hoverable story_template';
  templateBtn.title = 'Apply description template to this story';
  templateBtn.innerHTML = '<img src="//i.imgur.com/qvQ83UA.png">';
  cS.className = cS.className + ' capped';
  cS.insertAdjacentElement('beforebegin', templateBtn);

  templateBtn.querySelector('img').style.marginLeft = '-2px';
  templateBtn.querySelector('img').style.marginTop = '1px';
  templateBtn.addEventListener('click', generateStory, true);

  coffeeBtn.className = 'capped hoverable coffee_action';
  coffeeBtn.title = 'Add a cup of coffee to this story';
  coffeeBtn.innerHTML = '<img src="//i.imgur.com/qvQ83UA.png">';
  cS.insertAdjacentElement('beforebegin', coffeeBtn);

  coffeeBtn.querySelector('img').style.marginLeft = '-2px';
  coffeeBtn.querySelector('img').style.marginTop = '1px';
  coffeeBtn.addEventListener('click', incrementCoffeeCount, true);
}

function incrementCoffeeCount(e) {
  var nextSection = $('.story_template').parents('.model_details').eq(0).next(),
      textArea = nextSection.find('.editor.tracker_markup.description'),
      existingData = textArea.val(),
      ev = new jQuery.Event('keyup'), // jshint ignore:line
      coffeeText = "[intern]: <> ",
      internDataString,
      newData;

  ev.which = 13;
  ev.keyCode = 13;

  if (existingData.indexOf(coffeeText) >= 0) {
    var startPosition = existingData.indexOf(coffeeText),
        endPosition   = existingData.indexOf(')', startPosition) + 1;

    var initialString = existingData.substr(startPosition, endPosition - startPosition);
    var internDataObject = JSON.parse(JSON.stringify(eval(initialString.substr(coffeeText.length))));

    internDataObject.coffeeCount++;

    internDataString = '[intern]: <> (' + JSON.stringify(internDataObject) + ')';

    newData = existingData.replace(initialString, internDataString);
  } else {
    newData = existingData + '\n\n[intern]: <> ({"coffeeCount": 1})';
  }

  nextSection.find('.rendered_description').trigger('click');

  textArea.val(newData);

  nextSection.find('button[id^="story_description_done_"]').trigger('click');

  e.preventDefault();
}

function createFeatureTemplate() {
  var context    = '### Context\n---\n\n*Include background details for this story here*\n\n',
      htd        = '### How To Demo\n---\n\n1. *Start your demo here*\n\n',
      impDetails = '### Implementation Details\n---\n\n*Include technical details or considerations here*\n\n',
      uxDetails  = '### Design/UX Details\n---\n\n*Include design details or considerations here*\n\n';

  return context + htd + impDetails + uxDetails;
}

function createBugTemplate() {
  var context    = '### Context\n---\n\n*Include background details for this story here*\n\n',
      htr        = '### How To Replicate\n---\n\n1. *Start your replication process here*\n\n',
      outcomes   = '**Present outcome**\n\n**Expected outcome**\n\n',
      impDetails = '### Implementation Details\n---\n\n*Include technical details or considerations here*\n\n';

  return context + htr + outcomes + impDetails;
}

function createChoreTemplate() {
  var context    = '### Context\n---\n\n*Include background details for this story here*\n\n',
      questions    = '### Questions\n---\n\n*Add questions here*\n\n',
      impDetails = '### Implementation Details\n---\n\n*Include technical details or considerations here*\n\n';

  return context + questions + impDetails;
}

function createReleaseTemplate() {
  // Currently, we have no need for a description
  // tempalate on release stories
  return "";
}

function generateStory(e) {
  var nextSection = $('.story_template').parents('.model_details').eq(0).next(),
      textArea = nextSection.find('.editor.tracker_markup.description'),
      existingData = textArea.val(),
      ev = new jQuery.Event('keyup'), // jshint ignore:line
      markdown;

  ev.which = 13;
  ev.keyCode = 13;

  switch ($('input[name="story[story_type]"]').val()) {
    case 'feature':
      markdown = createFeatureTemplate();
      break;
    case 'bug':
      markdown = createBugTemplate();
      break;
    case 'chore':
      markdown = createChoreTemplate();
      break;
    case 'release':
      markdown = createReleaseTemplate();
      break;
    default:
      markdown = createFeatureTemplate();
  }

  origContent = '\n\n### Original Content\n---\n\n' + existingData,

  nextSection.find('.rendered_description').trigger('click');
  if (textArea.val()) {
    if (textArea.val() === markdown) {
      alert('The description for this story already matches the current template.');
    } else if (confirm('Existing description content will be placed at the bottom. Would you like to continue?')) {
      textArea.val(markdown + origContent);
    }
  } else {
    textArea.val(markdown);
  }

  nextSection.find('button[id^="story_description_done_"]').trigger('click');

  e.preventDefault();
}

chrome.extension.sendMessage({}, function() { // jshint ignore:line
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      $('body').on('DOMSubtreeModified', function() {
        checkForEditBar();
      });
    }
  }, 10);
});
