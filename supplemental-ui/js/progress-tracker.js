;(function () {
  'use strict'

  var STORAGE_KEY = 'antora-course-progress'

  function normalizeUrl(url) {
    // Remove hash, query params, trailing slashes
    return url.split('#')[0].split('?')[0].replace(/\/$/, '')
  }

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch (e) {
      return []
    }
  }

  function markCurrentPageVisited() {
    var currentUrl = normalizeUrl(window.location.pathname)
    var progress = getProgress()
    if (progress.indexOf(currentUrl) === -1) {
      progress.push(currentUrl)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    }
  }

  function updateNavigationMarks() {
    var progress = getProgress()
    document.querySelectorAll('[data-progress-path]').forEach(function (link) {
      var linkUrl = normalizeUrl(link.getAttribute('data-progress-path'))
      var mark = link.querySelector('.nav-progress-mark')
      if (mark && progress.indexOf(linkUrl) !== -1) {
        mark.style.display = 'inline'
      }
    })
  }

  function init() {
    markCurrentPageVisited()
    updateNavigationMarks()
  }

  // Global reset function for users
  window.clearCourseProgress = function() {
    localStorage.removeItem(STORAGE_KEY)
    location.reload()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()