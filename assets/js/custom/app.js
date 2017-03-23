(function () {

  'use strict';

  var app = {
    init: function() {
      toggleSiblings.init();
      toggleGroup.init();
      rememberCookie.init();
      nav.init();
      hashTrigger.init();
    }
  }
/* Common object for future triggers ======================================== */
  var Trigger = {
    state : {
      attr   : 'data-state',
      active : 'is-active'
    },
    config : {
      attr : ''
    },
    getTriggers : function() {
      return document.querySelectorAll('[' + this.config.attr + ']');
    },
    triggerEvents : function() {
      this.evClick();
    },
    evClick : function() {
      var _this    = this,
          _trigger = this.getTriggers(),
          i;

      for (i = 0; i < _trigger.length; i++) {
          _trigger[i].addEventListener('click', function(e) {

          _this.triggerLogic(this);

          e.preventDefault();
        });
      }
    },
    triggerLogic : function(el) {},
    setActive : function(el) {
      el.setAttribute(this.state.attr, this.state.active);
    },
    unsetActive : function(el) {
      el.setAttribute(this.state.attr, '');
    },
    dataAttrMatch : function(dataAttr, val) {
      return document.querySelectorAll('[' + dataAttr + '=' + val + ']');
    },
    getNodeIndex : function(node) {
      var index = 0;
      while ((node = node.previousSibling)) {
          if (node.nodeType != 3 || !/^\s*$/.test(node.data)) {
            index++;
          }
      }
      return index;
    },
    init : function() {
      this.triggerEvents();
    }
  }
/* Trigger that unsets active class from elements with same value of data-group
   attribute ================================================================ */
  var toggleGroup = Object.create(Trigger);

  toggleGroup.config = {
    attr: 'data-group',
  }

  toggleGroup.triggerLogic = function(trigger) {
    var _this       = this,
        group       = this.config.attr,
        state       = this.state.attr,
        activeState = this.state.active,
        val, groupArr, i;

    if (trigger.getAttribute(state) != activeState) {
      val = trigger.getAttribute(group);
      groupArr = _this.dataAttrMatch(group, val);

      for (i = 0; i < groupArr.length; i++) {
         _this.unsetActive(groupArr[i]);
      }

      _this.setActive(trigger);
    }
  }
/* Trigger that unsets active class from siblings of element specified in
   ata-siblings-toggle attribute ============================================ */
  var toggleSiblings = Object.create(Trigger);

  toggleSiblings.config = {
    attr     : 'data-siblings-toggle',
    childAttr: 'data-sibling'
  }

  toggleSiblings.triggerLogic = function(trigger) {
    var _this   = this,
        element = this.config.attr,
        target  = this.config.childAttr,
        val, sibling, siblings, i;

    val      = trigger.getAttribute(element);
    sibling  = _this.dataAttrMatch(target, val)[0];
    siblings = sibling.parentElement.children;

    for (i = 0; i < siblings.length; i++) {
       _this.unsetActive(siblings[i]);
    }

    _this.setActive(sibling);
  }
/* Trigger that responsible for hashtags ==================================== */
  var hashTrigger = Object.create(Trigger);

  hashTrigger.config = {
    attr: 'data-set-hash',

    tabs: {
      cls: '.tabs',
      headline: '.tabs-headline'
    }
  }

  hashTrigger.getHash = function() {
    return window.location.hash;
  }

  hashTrigger.triggerLogic = function(trigger) {
    window.location.hash = trigger.getAttribute('href');
  }

  hashTrigger.getHashHeadline = function() {
    var _this     = this,
        headlines, headline, i;

    if (window.innerWidth > 768) {
      headlines = tabs.getActiveTabs().children[0].querySelectorAll('[' + this.config.attr + ']')
    } else {
      headlines = tabs.getActiveTabs().children[1].querySelectorAll('[' + this.config.attr + ']')
    }

    for (i = 0; i < headlines.length; i++) {
      if (_this.getHash() == headlines[i].getAttribute('href')) {
        headline = headlines[i];
      }
    }

    return headline;
  }

  hashTrigger.setActiveHeadline = function() {
    var _this    = this,
        headline = this.getHashHeadline();

    if (headline != undefined) {
      toggleGroup.triggerLogic(headline);
      toggleSiblings.triggerLogic(headline);
    } else {
      _this.triggerLogic(_this.getFirstHeadline(tabs.getActiveTabs()));
      toggleSiblings.triggerLogic(_this.getFirstHeadline(tabs.getActiveTabs()));
    }
  }

  hashTrigger.getFirstHeadline = function(tab) {
    return tab.querySelectorAll('[' + this.config.attr + ']')[0];
  }

  hashTrigger.tab = function() {
    var _this = this;

    this.setActiveHeadline();
  }

  hashTrigger.init = function() {
    this.triggerEvents();
    this.tab();
  }
/* Common object for cookies ================================================ */
  var Cookie = {
    setCookie : function(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = 'expires='+ d.toUTCString();
        document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
    },
    getCookie: function(cname) {
      var name = cname + '=';
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(';');
      for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return '';
    }
  }
/* Trigger that responsible for remembering cookies when clicked on attr with
   data-cookie ============================================================== */
  var rememberCookie = Object.create(Trigger);

  rememberCookie.config = {
    attr: 'data-cookie'
  }

  rememberCookie.triggerLogic = function(target) {
    var cname = target.getAttribute(this.config.attr),
        val   = this.getNodeIndex(target);

    Cookie.setCookie(cname, val, 1);
  }
/* Object that responsible for sidebar-navigation 'memory' ================== */
  var nav = Object.create(rememberCookie);

  nav.config = {
    elId : 'sidebar-nav'
  }

  nav.getNav = function() {
    return document.getElementById(this.config.elId);
  }

  nav.getTriggers = function() {
    return this.getNav().children;
  }

  nav.triggerLogic = function(trigger) {
    var activeHeadline = tabs.getActiveHeadline();
    hashTrigger.triggerLogic(activeHeadline);
    toggleGroup.triggerLogic(activeHeadline);
    toggleSiblings.triggerLogic(activeHeadline);
  }

  nav.init = function() {
    var nav    = this.getNav(),
        index  = Cookie.getCookie(this.config.elId),
        target = nav.children[index];

    toggleGroup.triggerLogic(target);
    toggleSiblings.triggerLogic(target);

    this.triggerEvents();
  }
/* Object that responsible for tabs ========================================= */
  var tabs = Object.create(Trigger);

  tabs.config = {
    cssClass: '.tabs',
    headline: '.tabs-headline',
    contentW: '.tabs-content',
    contentInner: 'tabs-content-inner'
  }

  tabs.getHeadlines = function() {
    return document.querySelectorAll(this.config.headline);
  }

  tabs.cloneHeadlines = function() {
    var headlines = this.getHeadlines(),
        cloned = [],
        i, clone;

    if (headlines.length) {
      for (i = 0; i < headlines.length; i++) {
        clone = headlines[i].cloneNode(true);

        cloned.push(clone);
      }
    }

    return cloned;
  }

  tabs.insertClonedHeadlines = function() {
    var _this     = this,
        headlines = this.cloneHeadlines(),
        target, val, i;

    if (headlines.length) {
      for (i = 0; i < headlines.length; i++) {
        val = headlines[i].getAttribute('data-siblings-toggle');
        target = _this.dataAttrMatch('data-sibling', val);

        val = headlines[i].getAttribute('data-group');
        headlines[i].setAttribute('data-group', 'm-' + val);

        target[0].insertBefore(headlines[i], target[0].firstChild);
      }
    }
  }

  tabs.getActiveTabs = function() {
    var _this = this,
        tabs  = document.querySelectorAll(_this.config.cssClass),
        tab, i;

    for (i = 0; i < tabs.length; i++) {
       if (tabs[i].getAttribute(_this.state.attr) == _this.state.active) {
        tab = tabs[i];
      }
    }

    return tab;
  }

  tabs.getActiveTabHeadlines = function() {
    var headlines;

    if (window.innerWidth > 768) {
      headlines = tabs.getActiveTabs().children[0].querySelectorAll(this.config.headline)
    } else {
      headlines = tabs.getActiveTabs().children[1].querySelectorAll(this.config.headline)
    }

    return headlines;
  }

  tabs.getActiveHeadline = function() {
    var _this = this,
        headlines = this.getActiveTabHeadlines(),
        i, headline;

    for (i = 0; i < headlines.length; i++) {
       if (headlines[i].getAttribute(_this.state.attr) == _this.state.active) {
        headline = headlines[i];
      }
    }

    return headline;
  }

  tabs.setFirstHeadlinesActive = function() {
    var _this = this,
        headlines = document.querySelectorAll(this.config.headline),
        i;
    for (i = 0; i < headlines.length; i++) {
      if (_this.getNodeIndex(headlines[i]) == 0) {
        toggleGroup.triggerLogic(headlines[i]);
        toggleSiblings.triggerLogic(headlines[i]);
      }
    }
  }

  tabs.init = function() {
    this.setFirstHeadlinesActive();
    this.insertClonedHeadlines();
  }
  tabs.init();
  app.init();
})();
