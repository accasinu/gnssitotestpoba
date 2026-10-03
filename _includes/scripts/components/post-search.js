(function() {
  var form = document.getElementById('post-search-form');
  var dataElement = document.getElementById('post-search-data');
  var resultsElement = document.getElementById('post-search-results');
  var countElement = document.getElementById('post-search-count');
  var emptyElement = document.getElementById('post-search-empty');

  if (!form || !dataElement || !resultsElement || !countElement || !emptyElement) {
    return;
  }

  var posts = JSON.parse(dataElement.textContent).sort(function(left, right) {
    return right.date.localeCompare(left.date);
  });
  var titleInput = document.getElementById('post-search-title');
  var fromInput = document.getElementById('post-search-from');
  var toInput = document.getElementById('post-search-to');
  var tagSelect = document.getElementById('post-search-tag');
  var countTemplate = countElement.dataset.countTemplate;
  var dateFormatter;

  try {
    dateFormatter = new Intl.DateTimeFormat(document.documentElement.lang, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    dateFormatter = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  var tags = Array.from(new Set(posts.reduce(function(allTags, post) {
    return allTags.concat(Array.isArray(post.tags) ? post.tags : []);
  }, []))).sort(function(left, right) {
    return left.localeCompare(right);
  });

  tags.forEach(function(tag) {
    var option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagSelect.appendChild(option);
  });

  function render() {
    var query = titleInput.value.trim().toLocaleLowerCase();
    var fromDate = fromInput.value;
    var toDate = toInput.value;
    var selectedTag = tagSelect.value;
    var matches = posts.filter(function(post) {
      var titleMatches = !query || post.title.toLocaleLowerCase().indexOf(query) !== -1;
      var fromMatches = !fromDate || post.date >= fromDate;
      var toMatches = !toDate || post.date <= toDate;
      var tagMatches = !selectedTag || (Array.isArray(post.tags) && post.tags.indexOf(selectedTag) !== -1);
      return titleMatches && fromMatches && toMatches && tagMatches;
    });

    resultsElement.replaceChildren();
    emptyElement.hidden = matches.length !== 0;
    countElement.textContent = countTemplate.replace('[COUNT]', matches.length);

    matches.forEach(function(post) {
      var item = document.createElement('li');
      var link = document.createElement('a');
      var meta = document.createElement('div');
      var date = document.createElement('time');
      var tagsLabel = document.createElement('span');
      var dateParts = post.date.split('-').map(Number);

      item.className = 'post-search__result';
      link.className = 'post-search__title';
      link.href = post.url;
      link.textContent = post.title;

      meta.className = 'post-search__meta';
      date.dateTime = post.date;
      date.textContent = dateFormatter.format(new Date(dateParts[0], dateParts[1] - 1, dateParts[2]));
      meta.appendChild(date);

      if (Array.isArray(post.tags) && post.tags.length) {
        tagsLabel.textContent = post.tags.join(', ');
        meta.appendChild(tagsLabel);
      }

      item.appendChild(link);
      item.appendChild(meta);
      resultsElement.appendChild(item);
    });
  }

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', function(event) {
    event.preventDefault();
  });
  form.addEventListener('reset', function() {
    window.setTimeout(render, 0);
  });

  render();
})();