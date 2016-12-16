$(document).ready(function() {
	historySearch('week');

	$(".selector").change(function() {
		$(".vocabWord").remove();
		historySearch(this.value);
	});
});


function historySearch(length) {
	vocab = [];
	startTime = msTime(length);

	chrome.history.search({
		'text': 'wordreference',
		'startTime': startTime,
		'maxResults': 50
	}, function(results) {
		results.forEach(function(item) {
			if (!item.url.includes('forum')) {
				var wrSearchURL = item.url;
				var wrSearchTerm = termFromURL(item.url);

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
						'url': wrSearchURL
					}

					vocab.push(newEntry);
					vocab.sort(myComp);
				});
			}
		});
	});

	setTimeout(function(){
		vocab.forEach(function(word) {
			$('body').append('<p class="vocabWord"><a href=' + word.url + '>' + word.term + '</p></a>');
		});
	}, 400);

	// return vocab
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