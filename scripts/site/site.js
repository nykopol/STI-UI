var userAgent = navigator.userAgent || navigator.vendor || window.opera;
var isMobile = {
  windows: function() {
    return /IEMobile/i.test(userAgent);
  },
  android: function() {
    return /Android/i.test(userAgent);
  },
  blackberry: function() {
    return /BlackBerry/i.test(userAgent);
  },
  ios: function() {
    return /iPhone|iPad|iPod/i.test(userAgent);
  },
  any: function() {
    return (isMobile.android() || isMobile.blackberry() || isMobile.ios() || isMobile.windows());
  }
};

// counter related globals

function daysUntil(deadline) {
  var today = new Date();
  var millisecondsUntil = deadline.getTime() - today.getTime();
  return Math.floor(((((millisecondsUntil / 1000) / 60) / 60) / 24));
}

// video related globals

var videoPlayers  = [];
var intialVideoId = 1;

function loadYoutubePlayerScript() {
  var playerScriptTagId = '#player-script-tag';
  var $playerScriptTag  = $(playerScriptTagId);

  if (!($playerScriptTag.length > 0)) {
    $playerScriptTag = $('<script>').attr({
      'id':  playerScriptTagId,
      'src': 'https://www.youtube.com/iframe_api'
    });
    $('script').first().parent().prepend($playerScriptTag);
  }
}

function onYouTubeIframeAPIReady() {
  videoPlayers = $.map($('.video-placeholder'), function(videoPlaceholder) {
    var $videoPlaceholder = $(videoPlaceholder);
    var $video            = $videoPlaceholder.parent();
    var videoId           = $video.data('video-id');
    var youtubeVideoId    = $video.data('youtube-video-id');
    // remove placeholder styling
    $videoPlaceholder.removeClass('video-placeholder');
    return new YT.Player(videoPlaceholder, {
      width: 480,
      videoId: youtubeVideoId,
      events: {
        'onReady': function(e) {
          if (initialVideoId === videoId) {
            if(!isMobile.any()) {
              e.target.playVideo();
            }
          }
        }
      }
    });
  });
}

function setCurrentVideo(videoId) {
  var currentVideoIdIndex = videoId - 1;
  for (var i = 0; i < videoPlayers.length; i++) {
    var player = videoPlayers[i];
    if (i === currentVideoIdIndex) {
      if(!isMobile.any()) {
        player.playVideo();
      }
    } else {
      player.stopVideo();
    }
  }
}

// activating all youtube embeds on first click of any placeholder

$(function clickToActivate() {
  $('.video-placeholder').on('click', function() {
    initialVideoId = $(this).parent().data('video-id');
    loadYoutubePlayerScript();
  });
});

function registerAndSetupCounter() {

  var deadline = new Date('2016-07-18T13:00Z');
  var addCount = 4356;

  var $counter      = $('.counter').find('table').first();
  var $sentMessages = $counter.find('tr:nth-child(1)').find('td:nth-child(1)');
  var $daysLeft     = $counter.find('tr:nth-child(1)').find('td:nth-child(3)');

  $.get('/counter/count.json', function(counter) {
    $sentMessages.html((counter.count + addCount).toLocaleString());
    $daysLeft.html(daysUntil(deadline));
    $counter.css('visibility', 'visible').hide().fadeIn('slow');
  }).fail(function() {
    console.log('Error: "/counter/count.json" could not be loaded');
    $sentMessages.html(300);
    $daysLeft.html(daysUntil(deadline));
    $counter.css('visibility', 'visible').hide().fadeIn('slow');
  });

}

// document loaded and ready

$(document).ready(function() {

  // questionnaire iframe specifics

  $('#home__questionnaire__content__iframe').iFrameResize({
    log: true,
    heightCalculationMethod: 'max',
    messageCallback: function(context) {
      if (context.message === 'loaded' ||
        context.message === 'loading') {
          $('#questionnaire-loading-spinner').toggle();
      }
    }
  });

  // berec counter
  registerAndSetupCounter();

  // video

  $('.carousel').carousel({
    interval: false
  });

  $('#video-carousel').hammer().on('swipeleft', function(){
      $(this).carousel('next');
  });

  $('#video-carousel').hammer().on('swiperight', function(){
    $(this).carousel('prev');
  });

  $('#video-carousel').on('slid.bs.carousel', function (e) {
    var currentVideoId = $(e.relatedTarget).find('.home-video').first().data('video-id');
    setCurrentVideo(currentVideoId);
  })

  // scroll animations

  smoothScroll.init();

});
