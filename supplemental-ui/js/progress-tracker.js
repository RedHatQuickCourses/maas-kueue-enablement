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
      console.log('[Progress Tracker] Marked as visited:', currentUrl)
    } else {
      console.log('[Progress Tracker] Already visited:', currentUrl)
    }
  }

  function updateNavigationMarks() {
    var progress = getProgress()
    console.log('[Progress Tracker] Stored progress:', progress)
    console.log('[Progress Tracker] Current URL:', normalizeUrl(window.location.pathname))

    document.querySelectorAll('[data-progress-path]').forEach(function (link) {
      // Extract pathname from the actual href to match what we store
      var linkUrl
      try {
        // Convert relative href to absolute URL, then extract pathname
        var absoluteUrl = new URL(link.href, window.location.origin)
        linkUrl = normalizeUrl(absoluteUrl.pathname)
      } catch (e) {
        // Fallback to data-progress-path if URL parsing fails
        linkUrl = normalizeUrl(link.getAttribute('data-progress-path'))
      }
      var mark = link.querySelector('.nav-progress-mark')

      console.log('[Progress Tracker] Checking link:', {
        href: link.href,
        linkUrl: linkUrl,
        hasMarkElement: !!mark,
        isVisited: progress.indexOf(linkUrl) !== -1
      })

      if (mark && progress.indexOf(linkUrl) !== -1) {
        mark.style.display = 'inline'
        console.log('[Progress Tracker] ✓ Showing checkmark for:', linkUrl)
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

  // Debug function to help troubleshoot
  window.debugProgressTracker = function() {
    var progress = getProgress()
    var currentUrl = normalizeUrl(window.location.pathname)
    var navLinks = document.querySelectorAll('[data-progress-path]')

    console.log('=== Progress Tracker Debug Info ===')
    console.log('Current URL:', currentUrl)
    console.log('Stored Progress:', progress)
    console.log('Total nav links:', navLinks.length)

    navLinks.forEach(function(link, index) {
      var absoluteUrl = new URL(link.href, window.location.origin)
      var linkUrl = normalizeUrl(absoluteUrl.pathname)
      var mark = link.querySelector('.nav-progress-mark')

      console.log('Link #' + index + ':', {
        text: link.textContent.trim(),
        href: link.href,
        pathname: absoluteUrl.pathname,
        normalized: linkUrl,
        hasCheckmark: !!mark,
        isVisited: progress.indexOf(linkUrl) !== -1,
        checkmarkVisible: mark ? mark.style.display : 'N/A'
      })
    })
    console.log('===================================')
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()