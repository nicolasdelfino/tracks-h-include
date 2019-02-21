/*jslint indent: 2, browser: true, vars: true, nomen: true, loopfunc: true */

// Only loads on refresh(), to be used with initLazyLoad (below)
window.HInclude.HIncludeLazyElement = (function() {
  var proto = Object.create(HInclude.HIncludeElement.prototype);

  proto.connectedCallback = function(){};

  var HIncludeLazyElement = function() {
    return Reflect.construct(HTMLElement, arguments, HIncludeLazyElement);
  };
  HIncludeLazyElement.prototype = proto;

  customElements.define('h-include-lazy', HIncludeLazyElement);
  return HIncludeLazyElement;
})();

window.HInclude.HIncludeAnimatedElement = (function() {
  var proto = Object.create(HInclude.HIncludeElement.prototype);

  // restructure skeleton content so that tracks.js 
  // can animate incoming content
  proto.replaceContent = function(node) {
    var wrap = document.createElement('div');
    wrap.style.position = "relative";

    // tracks removes the skeleton by using the h-include-skeleton class
    var el = document.createElement('div');
    el.classList.add('h-include-skeleton');
    el.style.height = this.firstChild.offsetHeight + 'px';
    el.style.width = this.firstChild.offsetWidth + 'px';
    el.style.position = 'absolute';
    el.style.zIndex = -1;

    var elContent = this.firstChild.cloneNode(true);
    el.appendChild(elContent);
    wrap.appendChild(el);

    var container = document.createElement('div');
    wrap.appendChild(container);

    this.firstChild.parentNode.replaceChild(wrap, this.firstChild);
    container.innerHTML = node.innerHTML;
  };

  var HIncludeAnimatedElement = function() {
    return Reflect.construct(HTMLElement, arguments, HIncludeAnimatedElement);
  };
  HIncludeAnimatedElement.prototype = proto;

  customElements.define('h-include-animated', HIncludeAnimatedElement);
  return HIncludeAnimatedElement;
})();

// Imports resource fragments (containing links to scripts and styles)
window.HInclude.HImportElement = (function() {
  var proto = Object.create(HInclude.HIncludeElement.prototype);

  proto.createContainer = function(req){
    var container = document.implementation.createHTMLDocument(' ').documentElement;
    container.innerHTML = req.responseText;

    var importableElements =
      Array.prototype.slice.call(container.querySelectorAll('script, link'));

    var urls = importableElements.map(function(element) {
      if (element.tagName === 'SCRIPT') {
        return element.src;
      } else if (
          element.tagName === 'LINK' &&
          element.rel &&
          element.rel.toLowerCase() === 'stylesheet') {
        return element.href;
      }
    });

    HInclude.loadResources(urls);

    return container;
  };

  proto.replaceContent = function(node) {};

  var HImportElement = function() {
    return Reflect.construct(HTMLElement, arguments, HImportElement);
  };
  HImportElement.prototype = proto;

  customElements.define('h-import', HImportElement);
  return HImportElement;
})();

// Import resource fragments only on refresh(), to be used with initLazyLoad (below)
window.HInclude.HImportLazyElement = (function() {
  var proto = Object.create(HInclude.HImportElement.prototype);

  proto.connectedCallback = function(){};

  var HImportLazyElement = function() {
    return Reflect.construct(HTMLElement, arguments, HImportLazyElement);
  };
  HImportLazyElement.prototype = proto;

  customElements.define('h-import-lazy', HImportLazyElement);
  return HImportLazyElement;
})();

// Navigate within included content by handling link clicks
window.HInclude.HIncludeNavigateElement = (function() {
  var getElement = function(elementArg, nodeName) {
    var element;
    element = elementArg;
    while (element.parentNode && element.nodeName !== nodeName) {
      element = element.parentNode;
    }

    if (element.nodeName === nodeName) {
      return element;
    }
  };

  var getLink = function(element) {
    var link = getElement(element, 'A');

    if (link && link.href.length !== 0) {
      return link;
    }
  };

  var getHinclude = function(element) {
    return getElement(element, 'H-INCLUDE-NAVIGATE');
  };

  var handle = function(e) {
    var link = getLink(e.target);

    if (!link) return;

    // Detect target attribute
    var targetAttribute = link.getAttribute('target');
    if (targetAttribute === '_top') {
      // Treat as regular link
      return;
    }

    // Navigate
    var href = link.href;
    if (!href) return;

    var hElement = getHinclude(e.target);
    hElement.setAttribute('src', href);
    hElement.refresh();

    e.preventDefault();
  };

  var registerNavigation = function(element) {
    element.addEventListener('click', handle, true);
  };

  var proto = Object.create(HInclude.HIncludeElement.prototype);

  proto.connectedCallback = function(){
    HIncludeElement.prototype.connectedCallback.apply(this, arguments); // call super

    registerNavigation(this);
  };

  var HIncludeNavigateElement = function() {
    return Reflect.construct(HTMLElement, arguments, HIncludeNavigateElement);
  };
  HIncludeNavigateElement.prototype = proto;

  customElements.define('h-include-navigate', HIncludeNavigateElement);
  return HIncludeNavigateElement;
})();

// Lazy load elements using IntersectionObserver 
window.HInclude.initLazyLoad = function(selectorArg, configArg){
  var selector = selectorArg || 'h-include-lazy, h-import-lazy';
  var elements = Array.prototype.slice.call(document.querySelectorAll(selector));
  var config = {
    rootMargin: config && configArg.rootMargin || '400px 0px',
    threshold: config && configArg.threshold || 0.01 // 1% of the target is visible
  };

  var observer = new IntersectionObserver(onIntersection, config);
  [].forEach.call(elements, function(element) {
    observer.observe(element);
  });

  function onIntersection(entries) {
    entries.forEach(function(entry) {
      if (entry.intersectionRatio > 0) {
        observer.unobserve(entry.target);
        entry.target.refresh();
      }
    });
  }
};

// Load an array of script and stylesheet resources (to be overridden)
// By default, loadjs (https://github.com/muicss/loadjs) is used
window.HInclude.loadResources = function(urls){
  loadjs(urls, {
    async: false,
  });
}