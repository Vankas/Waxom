'use strict';
var multiItemSlider = (function() {
    return function(selector, config) {
        var
            _mainElement = document.querySelector(selector),
            _sliderWrapper = _mainElement.querySelector('.slider__wrapper'),
            _sliderItems = _mainElement.querySelectorAll('.slider__item'),
            _sliderControls = _mainElement.querySelectorAll('.slider__control'),
            _sliderControlLeft = _mainElement.querySelector('.slider__control_left'),
            _sliderControlRight = _mainElement.querySelector('.slider__control_right'),
            _wrapperWidth = parseFloat(getComputedStyle(_sliderWrapper).width),
            _itemWidth = parseFloat(getComputedStyle(_sliderItems[0]).width),
            _html = _mainElement.innerHTML,
            _indexIndicator = 0,
            _maxIndexIndicator = _sliderItems.length - 1,
            _indicatorItems,
            _positionLeftItem = 0,
            _transform = 0,
            _step = _itemWidth / _wrapperWidth * 100,
            _items = [],
            _interval = 0,
            _states = [
                { active: false, minWidth: 0, count: 1 },
                { active: false, minWidth: 576, count: 2 },
                { active: false, minWidth: 992, count: 3 },
                { active: false, minWidth: 1200, count: 4 },
            ],
            _config = {
                isCycling: false,
                direction: 'right',
                interval: 5000,
                pause: true
            };

        for (var key in config) {
            if (key in _config) {
                _config[key] = config[key];
            }
        }

        _sliderItems.forEach(function(item, index) {
            _items.push({ item: item, position: index, transform: 0 });
        });

        var _setActive = function() {
            var _index = 0;
            var width = parseFloat(document.body.clientWidth);
            _states.forEach(function(item, index, arr) {
                _states[index].active = false;
                if (width >= _states[index].minWidth)
                    _index = index;
            });
            _states[_index].active = true;
        }

        var _getActive = function() {
            var _index;
            _states.forEach(function(item, index, arr) {
                if (_states[index].active) {
                    _index = index;
                }
            });
            return _index;
        }

        var position = {
            getItemMin: function() {
                var indexItem = 0;
                _items.forEach(function(item, index) {
                    if (item.position < _items[indexItem].position) {
                        indexItem = index;
                    }
                });
                return indexItem;
            },
            getItemMax: function() {
                var indexItem = 0;
                _items.forEach(function(item, index) {
                    if (item.position > _items[indexItem].position) {
                        indexItem = index;
                    }
                });
                return indexItem;
            },
            getMin: function() {
                return _items[position.getItemMin()].position;
            },
            getMax: function() {
                return _items[position.getItemMax()].position;
            }
        }

        var _transformItem = function(direction) {
            var nextItem, currentIndicator = _indexIndicator;

            if (direction === 'right') {
                _positionLeftItem++;
                if ((_positionLeftItem + _wrapperWidth / _itemWidth - 1) > position.getMax()) {
                    nextItem = position.getItemMin();
                    _items[nextItem].position = position.getMax() + 1;
                    _items[nextItem].transform += _items.length * 100;
                    _items[nextItem].item.style.transform = 'translateX(' + _items[nextItem].transform + '%)';
                }
                _transform -= _step;
                _indexIndicator = _indexIndicator + 1;
                if (_indexIndicator > _maxIndexIndicator) {
                    _indexIndicator = 0;
                }
            }
            if (direction === 'left') {
                _positionLeftItem--;
                if (_positionLeftItem < position.getMin()) {
                    nextItem = position.getItemMax();
                    _items[nextItem].position = position.getMin() - 1;
                    _items[nextItem].transform -= _items.length * 100;
                    _items[nextItem].item.style.transform = 'translateX(' + _items[nextItem].transform + '%)';
                }
                _transform += _step;
                _indexIndicator = _indexIndicator - 1;
                if (_indexIndicator < 0) {
                    _indexIndicator = _maxIndexIndicator;
                }
            }
            _sliderWrapper.style.transform = 'translateX(' + _transform + '%)';
            _indicatorItems[currentIndicator].classList.remove('active');
            _indicatorItems[_indexIndicator].classList.add('active');
        }

        var _slideTo = function(to) {
            var i = 0,
                direction = (to > _indexIndicator) ? 'right' : 'left';
            while (to !== _indexIndicator && i <= _maxIndexIndicator) {
                _transformItem(direction);
                i++;
            }
        }

        var _cycle = function(direction) {
            if (!_config.isCycling) {
                return;
            }
            _interval = setInterval(function() {
                _transformItem(direction);
            }, _config.interval);
        }

        var _controlClick = function(e) {
            e.preventDefault();
            if (e.target.classList.contains('slider__control')) {
                var direction = e.target.classList.contains('slider__control_right') ? 'right' : 'left';
                _transformItem(direction);
                clearInterval(_interval);
                _cycle(_config.direction);
            }
            if (e.target.getAttribute('data-slide-to')) {
                _slideTo(parseInt(e.target.getAttribute('data-slide-to')));
                clearInterval(_interval);
                _cycle(_config.direction);
            }
        };

        var _handleVisibilityChange = function() {
            if (document.visibilityState === "hidden") {
                clearInterval(_interval);
            } else {
                clearInterval(_interval);
                _cycle(_config.direction);
            }
        }

        var _refresh = function() {
            clearInterval(_interval);
            _mainElement.innerHTML = _html;
            _sliderWrapper = _mainElement.querySelector('.slider__wrapper');
            _sliderItems = _mainElement.querySelectorAll('.slider__item');
            _sliderControls = _mainElement.querySelectorAll('.slider__control');
            _sliderControlLeft = _mainElement.querySelector('.slider__control_left');
            _sliderControlRight = _mainElement.querySelector('.slider__control_right');
            _wrapperWidth = parseFloat(getComputedStyle(_sliderWrapper).width);
            _itemWidth = parseFloat(getComputedStyle(_sliderItems[0]).width);
            _positionLeftItem = 0;
            _transform = 0;
            _indexIndicator = 0;
            _maxIndexIndicator = _sliderItems.length - 1;
            _step = _itemWidth / _wrapperWidth * 100;
            _items = [];
            _sliderItems.forEach(function(item, index) {
                _items.push({ item: item, position: index, transform: 0 });
            });
            _addIndicators();
        }

        var _setUpListeners = function() {
            _mainElement.addEventListener('click', _controlClick);
            if (_config.pause && _config.isCycling) {
                _mainElement.addEventListener('mouseenter', function() {
                    clearInterval(_interval);
                });
                _mainElement.addEventListener('mouseleave', function() {
                    clearInterval(_interval);
                    _cycle(_config.direction);
                });
            }

            document.addEventListener('visibilitychange', _handleVisibilityChange, false);
        }

        var _addIndicators = function() {
            var sliderIndicators = document.createElement('ol');
            sliderIndicators.classList.add('slider__indicators');
            for (var i = 0; i < _sliderItems.length; i++) {
                var sliderIndicatorsItem = document.createElement('li');
                if (i === 0) {
                    sliderIndicatorsItem.classList.add('active');
                }
                sliderIndicatorsItem.setAttribute("data-slide-to", i);
                sliderIndicators.appendChild(sliderIndicatorsItem);
            }
            _mainElement.appendChild(sliderIndicators);
            _indicatorItems = _mainElement.querySelectorAll('.slider__indicators > li')
        }

        // добавляем индикаторы
        _addIndicators();
        // инициализация
        _setUpListeners();

        if (document.visibilityState === "visible") {
            _cycle(_config.direction);
        }
        _setActive();

        return {
            right: function() {
                _transformItem('right');
            },
            left: function() {
                _transformItem('left');
            },
            stop: function() {
                _config.isCycling = false;
                clearInterval(_interval);
            },
            cycle: function() {
                _config.isCycling = true;
                clearInterval(_interval);
                _cycle();
            }
        }

    }
}());

var slider = multiItemSlider('.slider', {
    isCycling: true
});

var Menu = {

    el: {
        ham: $('.menu'),
        menuTop: $('.menu-top'),
        menuMiddle: $('.menu-middle'),
        menuBottom: $('.menu-bottom')
    },

    init: function() {
        Menu.bindUIactions();
    },

    bindUIactions: function() {
        Menu.el.ham
            .on(
                'click',
                function(event) {
                    Menu.activateMenu(event);
                    event.preventDefault();
                }
            );
    },

    activateMenu: function() {
        Menu.el.menuTop.toggleClass('menu-top-click');
        Menu.el.menuMiddle.toggleClass('menu-middle-click');
        Menu.el.menuBottom.toggleClass('menu-bottom-click');
    }
};

Menu.init();


$(".start_button").click(function() {
    $('html, body').animate({
        scrollTop: $("#services").offset().top
    }, 2000);
});


$(".button_load_more").click(function() {
    $('.categories_content_box_load').css({ "display": "flex" });
    $(".button_load_more").css({ "background-color": "grey" });
    $("#all").click(function() {
        $('.categories_content_box_load').css({ "display": "flex" });
        $(".button_load_more").css({ "background-color": "grey" });
    });

});

$(".menu_bottons").click(function() {
    $(this).addClass('active_button');
    $(".menu_bottons").not(this).removeClass('active_button');
});



$(".poster").click(function() {
    $(this).css("display", "none");
    $('.play').attr('src', 'http://www.youtube.com/embed/rRoy6I4gKWU?autoplay=1&mute=1');
});



$(document).ready(function() {
    $('.counter_number').each(function() {
        $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
        }, {
            duration: 2500,
            easing: 'swing',
            step: function(now) {
                $(this).text(Math.ceil(now));
            }
        });
    });
});


$(document).ready(function() {
    $('.owl-carousel').owlCarousel({
        loop: true,
        margin: 10,
        nav: true,
        autoWidth: true,
        center: true,
        responsive: {
            0: {
                items: 1
            },
            750: {
                items: 2
            },
            1000: {
                items: 3
            }
        }
    });
});


$(document).ready(function() {

    $("#all").click(function() {
        $('.Nature,.GraphicDesign,.Mock-Up,.Holiday,.Photography').css({ "display": "flex" });
        $(".button_load_more").prop("disabled", false);
        $(".button_load_more").css({ "background-color": "#998675" });
    });
    $("#nature").click(function() {
        $('.Nature').css({ "display": "flex" });
        $('.GraphicDesign, .Mock-Up, .Holiday').css({ "display": "none" });
        $('.categories_content_box_load').css({ "display": "none" });
        $(".button_load_more").prop("disabled", true);
        $(".button_load_more").css({ "background-color": "grey" });

    });
    $("#graphic").click(function() {
        $('.GraphicDesign').css({ "display": "flex" });
        $('.Photography, .Nature, .Holiday').css({ "display": "none" });
        $('.categories_content_box_load').css({ "display": "none" });
        $(".button_load_more").prop("disabled", true);
        $(".button_load_more").css({ "background-color": "grey" });

    });
    $("#mock").click(function() {
        $('.Mock-Up').css({ "display": "flex" });
        $('.Photography, .Nature, .Holiday').css({ "display": "none" });
        $('.categories_content_box_load').css({ "display": "none" });
        $(".button_load_more").prop("disabled", true);
        $(".button_load_more").css({ "background-color": "grey" });

    });
    $("#holliday").click(function() {

        $('.Mock-Up,.GraphicDesign,.Nature').css({ "display": "none" });
        $('.Holiday').css({ "display": "flex" });
        $('.categories_content_box_load').css({ "display": "none" });
        $(".button_load_more").prop("disabled", true);
        $(".button_load_more").css({ "background-color": "grey" });

    });
    $("#photography").click(function() {
        $('.Mock-Up,.GraphicDesign,.Nature').css({ "display": "none" });
        $('.Photography .Holiday, .Nature ').css({ "display": "flex" });
        $('.categories_content_box_load').css({ "display": "none" });
        $(".button_load_more").prop("disabled", true);
        $(".button_load_more").css({ "background-color": "grey" });

    });

    $(".menu").click(function() {
        if ($("#span").hasClass("menu-top-click")) {
            setTimeout(function() {
                document.getElementById('header_box_id').style.display = 'flex';
            }, 1000);
            // $(".header_box").css({ "display": "flex" })
            $(this).data('status', true);
        } else {
            $(".header_box").css({ "display": "none" })
            $(this).data('status', false);
        }
    });
})