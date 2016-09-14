"use strict";

var X = function( response ) {
	onSite.data = response.data;
	window.vitrine.render();
};

var onSite = {
	data: null
};



onSite.utils = function() {
	
	return {
		
		getRemote: function( url ) {
			var script = document.createElement( 'script' );
			script.src = url;
			document.head.appendChild( script );
		},
		
		/*
		 * Pegando emprestado o jQuery.isPlainObject();
		 */
		isPlainObject: function( obj ) {
			// Not plain objects:
			// - Any object or value whose internal [[Class]] property is not "[object Object]"
			// - DOM nodes
			// - window
			if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
				return false;
			}

			if ( obj.constructor &&
					!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}

			// If the function hasn't returned already, we're confident that
			// |obj| is a plain object, created by {} or constructed with new Object
			return true;
		},		
		
		isFunction: function( obj ) {
			return jQuery.type(obj) === "function";
		},		
		
		/*
		 * Pegando emprestado o jQuery.extend();
		 */
		extend: function() {
			var options, name, src, copy, copyIsArray, clone,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length,
				deep = false;

			// Handle a deep copy situation
			if ( typeof target === "boolean" ) {
				deep = target;

				// Skip the boolean and the target
				target = arguments[ i ] || {};
				i++;
			}

			// Handle case when target is a string or something (possible in deep copy)
			if ( typeof target !== "object" && ! this.isFunction(target) ) {
				target = {};
			}

			// Extend jQuery itself if only one argument is passed
			if ( i === length ) {
				target = this;
				i--;
			}

			for ( ; i < length; i++ ) {
				// Only deal with non-null/undefined values
				if ( (options = arguments[ i ]) != null ) {
					// Extend the base object
					for ( name in options ) {
						src = target[ name ];
						copy = options[ name ];

						// Prevent never-ending loop
						if ( target === copy ) {
							continue;
						}

						// Recurse if we're merging plain objects or arrays
						if ( deep && copy && ( this.isPlainObject(copy) ||
							(copyIsArray = jQuery.isArray(copy)) ) ) {

							if ( copyIsArray ) {
								copyIsArray = false;
								clone = src && Array.isArray(src) ? src : [];

							} else {
								clone = src && this.isPlainObject(src) ? src : {};
							}

							// Never move original objects, clone them
							target[ name ] = this.extend( deep, clone, copy );

						// Don't bring in undefined values
						} else if ( copy !== undefined ) {
							target[ name ] = copy;
						}
					}
				}
			}

			// Return the modified object
			return target;
		},

		stringTruncate: function( string, n ) {
			return string.length > n ? string.substr( 0, n-1 ) + '&hellip;' : string;
		}
	};
};


onSite.vitrine = function( userOptions ) {
	
	var _defaultOptions = {
		targetElementId: 'onsite-vitrine',
		url: 'http://www.json.org'
	};
	
	var _utils = new onSite.utils();
	
	var _options = _utils.extend( {}, _defaultOptions, userOptions );

	var _targetElement = document.getElementById( _options.targetElementId );

	var _container = document.getElementById( 'onsite-vitrine-container' );
	
	_utils.getRemote( _options.url );

	var _itemTemplate = ' \
			<li class="onsite-vitrine-item"> \
				<div class="onsite-vitrine-itembox"> \
					<img src="<%this.imageName%>" /> \
					<p class="onsite-vitrine-item-name"><%this.name%></p> \
					<div class="onsite-vitrine-item-oldprice">De: <span><%this.oldPrice%></span></div> \
					<div class="onsite-vitrine-item-price">Por: <span><%this.price%></span></div> \
					<div class="onsite-vitrine-item-paymentconditions"><%this.productInfo.paymentConditions%></div> \
				</div> \
			</li> \
	';

	/*
	 * Pegando emprestado a template engine de:
	 * http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line
	 */
	var _templateEngine = function( html, options ) {
		var re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0, match;
		var add = function(line, js) {
			js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
			(code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
			return add;
		}
		while(match = re.exec(html)) {
			add(html.slice(cursor, match.index))(match[1], true);
			cursor = match.index + match[0].length;
		}
		add(html.substr(cursor, html.length - cursor));
		code += 'return r.join("");';
		return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
	}

	var _vitrineHTML = '';
	var _renderItem = function( itemData ) {
		_vitrineHTML += _templateEngine( _itemTemplate, itemData );
	};

	var _btnLeftClick = function() {
		_container.style.transformation = 'translateX(-20em)';
	};

	var _prepareButtons = function() {
		var leftBtn = document.getElementById( 'onsite-btn-left' );
		var rightBtn = document.getElementById( 'onsite-btn-right' );

		leftBtn.addEventListener( 'click', _btnLeftClick);
	};
	
	return {
		render: function() {

			_vitrineHTML += '\
				<button id="onsite-btn-left" class="onsite-vitrine-button left">\
					<li class="fa fa-angle-left"></li>\
				</button> \
				<button id="onsite-btn-right" class="onsite-vitrine-button right">\
					<li class="fa fa-angle-right"></li>\
				</button>\
				<div id="onsite-vitrine-container">\
					<ul class="onsite-vitrine-list">';

			onSite.data.recommendation.forEach( function( currentValue, index, array ) {
				currentValue.name = _utils.stringTruncate( currentValue.name, 100 );
				_renderItem( currentValue );
			} );

			_vitrineHTML += '\
					</ul>\
				</div>';

			_targetElement.insertAdjacentHTML( 'beforeend', _vitrineHTML );

			_prepareButtons();
		}
	};
	
};

