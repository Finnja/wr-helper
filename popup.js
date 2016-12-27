$(document).ready(function() {
	historySearch('week', 'en-fr');

	$("#date-selector").change(function() {
		$(".vocabWord").remove();
		historySearch(this.value, $("#lang-selector").val());
	});

	$("#lang-selector").change(function() {
		$(".vocabWord").remove();
		historySearch($("#date-selector").val(), this.value);
	});

	// link manager
	$('body').on('click', 'a', function(){
		chrome.tabs.create({url: $(this).attr('href')});
		return false;
	});
});


function historySearch(length, lang) {
	vocab = [];
	startTime = msTime(length);

	langKeywords = {
		'en-fr': ['enfr', 'fren', 'FRVerbs'],
		'en-es': ['translation.asp', 'ESVerbs'],
		'fr-es': ['esfr', 'fres', 'FRVerbs', 'ESVerbs']
	}

	kw = langKeywords[lang];

	chrome.history.search({
		'text': 'wordreference',
		'startTime': startTime,
		'maxResults': 50
	}, function(results) {
		results.forEach(function(item) {

			var kwPresent = multiWordSearch(item.url, kw);

			if (!item.url.includes('forum') && item.url.length > 29 && item.url.length < 65 && kwPresent) {
				var wrSearchURL = item.url;
				var wrSearchTerm = termFromURL(item.url, lang);
				var originLang;

				if (item.url.includes('conj')){
					originLang = item.url.slice(34,36).toLowerCase();
				}
				else {
					if (lang == 'en-es') {
						if (wrSearchURL.includes('tranword')) {
							originLang = 'en'
						}
						else {
							originLang = 'es';
						}
					}
					else {
						originLang = item.url.slice(29,31).toLowerCase();
					}
				}

				chrome.history.getVisits({'url': wrSearchURL}, function(visitInfo) {
					var n = 0;
					visitInfo.forEach(function(visit) {
						// visits within the last day/week/month
						if (visit.visitTime > startTime) {
							n = n + 1;
						}
					})

					newEntry = {
						'freq': n,
						'term': wrSearchTerm,
						'url': wrSearchURL,
						'lang': originLang
					}

					vocab.push(newEntry);
					vocab.sort(myComp);
				});
			}
		});
	});

	setTimeout(function(){
		vocab.forEach(function(word) {
			$('.results-container').append('<div class="vocab-word" id="' + word.lang + '"><a href=' + word.url + '><p>' + word.term + '</a></p></div>');
		});
	}, 600);

	$(".results-container:nth-child(odd)").css("background-color", "blue");

	console.log(vocab);
}

function msTime(length) {
	day = 86400000;

	if( length == 'day') {
		return (Date.now() - day);
	}
	else if (length == 'week') {
		return (Date.now() - day*7)
	}
	else {
		return (Date.now() - day*31)
	}
}


function myComp(a,b) {
  return b['freq'] - a['freq'];
}

function termFromURL(url, lang) {
	/* takes wordreference url and returns search term (or phrase)  */ 
	if(url.includes('conj')) {
			return decodeURIComponent(url.slice(49))
		}
	
	else {
		if (lang == 'en-es'){
			if (url.includes('tranword')) {
				return decodeURIComponent(url.slice(57))
			}
			else {
				return decodeURIComponent(url.slice(56))
			} 
		}
		else {
			return decodeURIComponent(url.slice(34))
		}
	}
}

function multiWordSearch(text, searchWords) {
	for (var i = searchWords.length - 1; i >= 0; i--) {
		if (text.includes(searchWords[i])) return true;
	 } 
	return false;
}


