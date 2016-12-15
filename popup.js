$(document).ready(function() {
	
	console.log(historySearch('week'));

	$(".selector").change(function() {
  		results = historySearch(this.value);
  		results.sort(myComp);
		console.log(results)
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
			var wrSearchURL = item.url;
			var wrSearchTerm = decodeURIComponent(item.url.slice(34)); // FIX URL PARSING

			chrome.history.getVisits({'url': wrSearchURL}, function(visitInfo) {
				// vocab[wrSearchTerm] = visitInfo.length;
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
		});
	});

	return vocab;
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