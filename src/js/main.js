import $ from "jquery";

window.$ = $;
window.Popper = require('popper.js').default;
require('bootstrap');
import bootbox from "bootbox";
import moment from "moment";
import countdown from "jquery-countdown";
import config from "../../config.json";
import {trackEvent} from './modules/shared/trackers';

$(document).ready(function() {

  /* actual language */
  var langItems = [
    {code: 'en', title: 'ENG', link: '/en'},
    {code: 'ru', title: 'RUS', link: '/ru'},
    {code: 'jp', title: 'JPN', link: '/jp'}];
  var langFromHtmlTag = $('html').attr('lang');
  if (langFromHtmlTag) {
    $('#langBtn').data('lang', langFromHtmlTag);
    var firstLang = langItems.filter(function(lang) {
      return lang.code === langFromHtmlTag
    })[0];
    if (firstLang) {
      $('#langBtn').text(firstLang.title);
    }
  }
  /**/

  /* language vars */
  if (langFromHtmlTag) {
    var langVariables = config.translations[langFromHtmlTag];
    if (langVariables) {
      Object.keys(langVariables).forEach(function(langVariable) {
        $('[data-bind="' + langVariable + '"]').html(langVariables[langVariable]);
        $('[data-bindPlaceholder="' + langVariable + '"]').attr("placeholder", langVariables[langVariable]);
      });
    }
  }
  /**/

  /* language selector */
  $('#langBtn').click(function(event) {
    var actualLang = $(event.target).data().lang;
    var langPanel = $(event.target).parent().find('#langPanel');
    var actualLangItem = langPanel.children().children("[data-lang=" + actualLang + "]");
    actualLangItem.addClass('-active');
    actualLangItem.detach().sort();
    langPanel.children().prepend(actualLangItem);
    langPanel.addClass('-visible');
  });

  $('#langPanel').click(function(event) {
    // event.preventDefault();
    if ($(event.target).parent().data().lang) {
      $('#langBtn').data('lang', $(event.target).parent().data().lang);
      $('#langBtn').text($(event.target).parent().text());
    }
    $('#langPanel').removeClass('-visible');
    $('#langPanel').find('li').removeClass('-active');
  });
  /**/

  /* menu navigation */
  var menuItem = $("nav.via-nav ul.via-nav-menu li")
  menuItem.on('touchstart click', function(e) {
    var link = $(this).children()[0];
    var targetLink = link.target;
    if (targetLink !== '_blank') {
      e.preventDefault();
      var targetId = link.hash;
      if ($('.mobileMenu').hasClass('-opened')) {
        $('.mobileMenu').removeClass('-opened');
      }
      $('html, body').animate({
        scrollTop: $(targetId).offset().top
      }, 500);
    }
  });
  /**/

  /* mobile menu */
  $('.mobileMenuTriger').click(function(event) {
    $('.mobileMenu').toggleClass('-opened', '-opened');
  });
  /**/

  /* count down */
  var endTime = "2018-01-20T16:00:00+00:00";
  var formattedEndTime = moment(new Date(endTime)).format('YYYY/MM/DD HH:mm');
  $('.days').countdown(formattedEndTime, function(event) {
    $(this).html(event.strftime('%D'));
  });

  $('.hours').countdown(formattedEndTime, function(event) {
    $(this).html(event.strftime('%H'));
  });

  $('.minutes').countdown(formattedEndTime, function(event) {
    $(this).html(event.strftime('%M'));
  });

  $('.seconds').countdown(formattedEndTime, function(event) {
    $(this).html(event.strftime('%S'));
  });
  /**/

  /* send feedback form */
  $('.feedbackForm').submit(function(event) {
    event.preventDefault();
    var form = $(event.target).find(".email").serialize();
    var email = $(event.target).find(".email").val();
    if (!email) {
      bootbox.alert({
        title: langVariables.popUpforgetEmail,
        message: langVariables.forgetEmail,
        backdrop: true,
        callback: function() {
          console.log('email is empty');
        }
      });
      trackEvent('wp_main');
      return false;
    }
    $.ajax({
      type: "POST",
      url: "/create_request",
      data: form,
      success:  function (data) {
        if (data['succes'] === true) {
          bootbox.alert({
            title: langVariables.successTitle,
            message: langVariables.successMessage,
            backdrop: true,
            callback: function () {
              console.log('succes');
              $('#feedbackForm').find("#email").val('');
            }
          });
        } else {
          bootbox.alert({
            title: "Error",
            message: data['errors'],
            backdrop: true,
            callback: function () {
              console.log('server error');
            }
          });
        }
      },
      error: function() {
        bootbox.alert({
          title: langVariables.popUpError,
          message: langVariables.popUpErrorDesc,
          backdrop: true,
          callback: function() {
            console.log('server error');
          }
        });
      }
    });
    return false;
  });
  /**/

  /* modals */
  /* Buy token */
  $('.buyToken').click(function(event) {
    var buyTokenPopUp = bootbox.dialog({
      title: 'Buy token',
      message: '<p></p>',
      backdrop: true,
      backdrop: true,
      onEscape: function() {
        console.log('close modal');
      },
    });
    buyTokenPopUp.find('.bootbox-body').html($('#buyTokenPopUp').clone());

    /* send Buy token form */
    $(buyTokenPopUp).find('form').submit(function(event) {
      event.preventDefault();
      var form = $(event.target).find(".via-form-input").serialize();
      var email = $(event.target).find(".via-form-input").val();
      if (!email) {
        bootbox.alert({
          title: langVariables.popUpforgetEmail,
          message: langVariables.forgetEmail,
          backdrop: true,
          callback: function() {
            console.log('email is empty');
          }
        });
        return false;
      }
      $.ajax({
        type: "POST",
        url: "/create_request",
        data: form,
        success:  function (data) {
          if (data['succes'] === true) {
            bootbox.alert({
              title: langVariables.successTitle,
              message: langVariables.successMessage,
              backdrop: true,
              callback: function () {
                console.log('succes');
                $('#feedbackForm').find("#email").val('');
              }
            });
          } else {
            bootbox.alert({
              title: "Error",
              message: data['errors'],
              backdrop: true,
              callback: function () {
                console.log('server error');
              }
            });
          }
        },
        error: function() {
          bootbox.alert({
            title: langVariables.popUpError,
            message: langVariables.popUpErrorDesc,
            backdrop: true,
            callback: function() {
              console.log('server error');
            }
          });
        }
      });
      return false;
    });
    /**/
  });
  /**/

  /* Get WP */
  $('.getWP').click(function(event) {
    var getWpPopUp = bootbox.dialog({
      title: 'Get WP',
      message: '<p></p>',
      backdrop: true,
      onEscape: function() {
        console.log('close modal');
      },
    });
    getWpPopUp.find('.bootbox-body').html($('#getWpPopUp').clone());

    getWpPopUp.find('button[type="submit"]').click(function() {
      trackEvent('wp_popup');
    });

    /* send Buy token form */
    $(getWpPopUp).find('form').submit(function(event) {
      event.preventDefault();
      var form = $(event.target).find(".via-form-input").serialize();
      var email = $(event.target).find(".via-form-input").val();
      if (!email) {
        bootbox.alert({
          title: langVariables.popUpforgetEmail,
          message: langVariables.forgetEmail,
          backdrop: true,
          callback: function() {
            console.log('email is empty');
          }
        });
        return false;
      }
      $.ajax({
        type: "POST",
        url: "/create_request",
        data: form,
        success:  function (data) {
          if (data['succes'] === true) {
            bootbox.alert({
              title: langVariables.successTitle,
              message: langVariables.successMessage,
              backdrop: true,
              callback: function () {
                console.log('succes');
                $('#feedbackForm').find("#email").val('');
              }
            });
          } else {
            bootbox.alert({
              title: "Error",
              message: data['errors'],
              backdrop: true,
              callback: function () {
                console.log('server error');
              }
            });
          }
        },
        error: function() {
          bootbox.alert({
            title: langVariables.popUpError,
            message: langVariables.popUpErrorDesc,
            backdrop: true,
            callback: function() {
              console.log('server error');
            }
          });
        }
      });
      return false;
    });
    /**/
  });
  /**/
  /**/

  /* profile links */
  $('.profile-links').click(function(event) {
    if ($(event.currentTarget).attr('href').indexOf('sign_up') > 0) {
      trackEvent('sign_up');
    }
  });

  /* play video onclick */
  $('video').on('touchstart click', function(e) {
    e.preventDefault();
    console.log(e);
    if (typeof InstallTrigger === 'undefined') {
      var clickY = (e.pageY - $(this).offset().top);
      var height = parseFloat($(this).height());
      if (clickY > 0.82 * height) return;
      this.paused ? this.play() : this.pause();
    }
  });
  /**/

  /* show video poster after video ended */
  var video = $('video');
  video.on('ended', function(e) {
    video.get(0).load();
  });
  /**/

  /* footer social links */
  const socialMatchToActionNameMap = {
    facebook: 'fb',
    instagram: 'instagram',
    twitter: 'twitter',
    medium: 'medium',
    vk: 'vkontakte'
  };
  $('.via-social a').click((event) => {
    const $item = $(event.currentTarget);
    const href = $item.attr('href');
    if ($.type(href) === 'string' && href) {
      for (let social in socialMatchToActionNameMap) {
        if (href.indexOf(social) > 0) {
          trackEvent(socialMatchToActionNameMap[social]);
        }
      }
    }
  });
  /**/

  /* document links */
  $('.via-page-documents-wrap').click((event) => {
    const $item = $(event.currentTarget);
    const id = $item.attr('id');
    if ($.type(id) === 'string' && id) {
      const idSplits = id.split('-');
      if (idSplits.length) {
        const action = idSplits[idSplits.length - 1];
        trackEvent(action);
      }
    }
  });
  /**/
});
