$(document).ready(function() {
	historySearch('week', 'en-fr');

	$(".selector").change(function() {
		$(".vocabWord").remove();
		historySearch(this.value, 'en-fr');
	});
});


function historySearch(length, lang) {
	vocab = [];
	startTime = msTime(length);

	langKeywords = {
		'en-fr': ['enfr', 'fren', 'FRVerbs'],
		'en-es': ['enes', 'esen', 'ESVerbs'],
		'fr-es': ['esfr', 'fres', 'FRVerbs', 'ESVerbs']
	}

	kw = langKeywords[lang];

	console.log(kw)

	chrome.history.search({
		'text': 'wordreference',
		'startTime': startTime,
		'maxResults': 50
	}, function(results) {
		results.forEach(function(item) {

			var kwPresent = multiWordSearch(item.url, kw);
			console.log(item.url, item.url.length, kwPresent);

			if (!item.url.includes('forum') && item.url.length > 29 && item.url.length < 65 && kwPresent) {
				var wrSearchURL = item.url;
				var wrSearchTerm = termFromURL(item.url);

				if (item.url.includes('conj')){
					var originLang = item.url.slice(34,36).toLowerCase();
				}
				else {
					var originLang = item.url.slice(29,31).toLowerCase();
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
			$('body').append('<p class="vocabWord"><a href=' + word.url + '>' + word.term + ' [' + word.lang + ']</p></a>');
		});
	}, 400);

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

function termFromURL(url) {
	/* takes wordreference url and returns search term (or phrase)  */ 
	if(url.includes('conj')) {
		return decodeURIComponent(url.slice(49))
	}
	else {
		return decodeURIComponent(url.slice(34))
	}
}

function multiWordSearch(text, searchWords) {
	for (var i = searchWords.length - 1; i >= 0; i--) {
		if (text.includes(searchWords[i])) return true;
	 } 
	return false;
}


