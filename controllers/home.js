/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  res.render('home', {
    title: 'Home'
  });
};

exports.play = function(req, res) {
  res.render('play', {
    title: 'Play'
  });
};
