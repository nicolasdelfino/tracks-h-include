var loaded = 2;

function createLazyWithEndpoint(endpoint) {
  var base = document.getElementsByClassName("panels")[0];
  var footerEl = document.createElement("h-import-lazy");
  footerEl.setAttribute("src", endpoint);
  base.appendChild(footerEl);
}

function getLazyFooterAssets() {
  createLazyWithEndpoint("http://localhost:4000/footer-resources?loaded=" + loaded);
}

function createLoadingSkeleton() {
  var base = document.createElement("div");
  base.classList.add('panel')
  var ul = document.createElement("ul");
  base.appendChild(ul)
  for(var i = 0; i < 3; i++) {
    var li = document.createElement("li");
    ul.appendChild(li)
  }

  return base;
}

function createBlock() {
  var base = document.getElementsByClassName("panels")[0];
  var hIncludeType = "h-include-animated"
  var panel = document.createElement(hIncludeType);
  var loadingWrapper = document.createElement("div");
  loadingWrapper.classList.add('panel');

  panel.appendChild(createLoadingSkeleton());
  panel.setAttribute("src", "http://localhost:4000/panel?loaded=" + loaded);
  base.appendChild(panel);

  document.getElementById("amount").innerText = " " + loaded;
}

function createFooter() {
  var base = document.getElementsByClassName("panels")[0];
  var hIncludeType = "h-include"
  var footer = document.createElement(hIncludeType);
  var loadingWrapper = document.createElement("div");
  loadingWrapper.classList.add('footer');

  var loadingText = document.createTextNode("loading footer...");
  loadingWrapper.appendChild(loadingText);
  footer.appendChild(loadingWrapper);

  footer.setAttribute("src", "http://localhost:4000/footer?loaded=" + loaded);
  base.appendChild(footer);
  document.getElementById("amount").innerText = " " + loaded;

  getLazyFooterAssets()
  HInclude.initLazyLoad('h-import-lazy');
}

function handler(entries, observer) {
  var max = 8;
  for (var k = 0; k < entries.length; ++k) {
      var entry = entries[k];
      if (entry.isIntersecting) {
        if (loaded <= max) {
          if (loaded === max) {
            createFooter()
          } else {
            createBlock()
          }
          loaded += 1;
        }
      }
  }

};

document.addEventListener("DOMContentLoaded", function (event) {
  
  var stateA = {
    opacity: 0,
    padding: '50px 5px 0 5px'
  };

  var stateB = {
    padding: 0,
    opacity: 1,
    width: 'auto',
    height: 'auto',
    ease: 'easeInOutQuart',
  };

  window.Tracks.on('.panel', function(el) {
    return window.Tracks.fromTo(el, stateA, stateB, 1).then(function() {
      
      // remove skeleton
      var skeletonElement = el.parentNode.parentNode.querySelector('.h-include-skeleton');
      skeletonElement && skeletonElement.remove();
    });
  }); 

  // make sure we go beyond the fold
  createBlock();

  var observer = new IntersectionObserver(handler);
  observer.observe(document.getElementById("target"));
});