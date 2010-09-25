/**
 * mycoffeespoon.com
 *
 * Author: Tyler Gaw www.tylergaw.com
 * Description: Photography website
 *
 */
	
var CP = function ()
{	
	var $this    = this,
		sets     = [],
		photos   = {},
		internal = {};
	
	// Site photos navigation
	internal.navigation = {
		init: function ()
		{
			var html = [];
			
			$.each(sets, 
				function (i, set)
				{
					var klass = '';
					
					if (i === (sets.length - 1))
					{
						klass = 'last-photo-set-link';
					}
					
					html.push('<li class="' + klass + '"><a href="#' + set.name + '"');
					html.push(' rel="' + set.name + '">');
					html.push(set.name + '</a></li>');
				}
			);
			
			$('header:eq(0) ul').prepend(html.join('')).show();
			internal.address.init();
		},
		
		setActive: function (itemName)
		{
			var parent = $('a[rel="' + itemName + '"]').parent();
			parent.addClass('active').siblings().removeClass('active');
		}
	};
	
	// Using jquery.address, handle hashchanges
	internal.address = {	
		init: function ()
		{
			var changeWasCalled = false;
			
			// Bind the address change event to our load page
			$.address.change(
				function (e)
				{			
					changeWasCalled = true;
					internal.navigation.setActive(e.pathNames[0]);
					internal.loadSection(e);
				}
			);
			
			// For all a tags, route their click even to the address event
			// NOTE: We look for the rel attribute instead of the href as
			// a workaround for IE. For all IE <a>s the href automatically
			// has the full URL prepended to it. We don't want that.
			$('a').address(
				function () 
				{
					if ($(this).attr('rel'))
					{
						return $(this).attr('rel');
					}
				}
			);
			
			// When initialy loaded, or loaded without a specific URL 
			// we need to direct it to the correct page
			/*
			if ($.address.value() === '/')
			{
				$.address.value('/foobar');
			}
			*/

			// We were having trouble with the address change() event not firing
			// when refreshing the page, or navigating straight to a hashed page
			// so we need to check to see if change has not been called and act.
			if (!changeWasCalled)
			{
				$.address.update();
			}
		}
	};
	
	// Load the section provided from the URL hash
	internal.loadSection = function (sectionInfo)
	{
		var sectionName = sectionInfo.pathNames[0] || null,
			photoSet    = null,
			container   = null,
			imgHtml     = [];
		
		if (sectionName)
		{
			photoSet = photos[sectionName];
			internal.slideshow.enabled = true;
			internal.slideshow.index   = 0;
			internal.slideshow.set     = sectionName;
			
			// Create a hidden container for the images
			if ($('#container-' + sectionName).length === 0)
			{
				container = $('<div />', {
					'class': 'hidden-photo-container',
					'id': 'container-' + sectionName,
				});

				$('body').append(container);

				// Append an image element for each photo in the set
				$.each(photoSet, 
					function (i, photo)
					{
						imgHtml.push('<img src="' + photo + '">');
					}
				);
				container.append(imgHtml.join(''));
			}
			
			internal.slideshow.change();
		}
		else
		{
			
		}
	};
	
	// spinning loader graphic
	internal.loader = {
		show: function ()
		{
			$('#loading-indicator').show();
		},
		
		hide: function ()
		{
			$('#loading-indicator').hide();
		}
	};
	
	// Image slideshow
	internal.slideshow = {
		enabled: false,
		index: 0,
		set: null,
		
		init: function ()
		{
			var slideshow = this;
			this.controls.init();
			
			$(document).keyup(
				function (e)
				{
					switch (e.keyCode)
					{
					case 37:
						slideshow.prev();
						break;
					case 39:
						slideshow.next();
						break;
					};
				}
			);
		},
		
		change: function ()
		{
			var img = photos[this.set][this.index];
			internal.loader.show();
			
			$('#slideshow-image').animate({opacity: 0}, 200, 
				function ()
				{
					$(this).attr('src', img);
					internal.loader.hide();
				}
			).animate({opacity: 1}, 200);
		},
		
		next: function ()
		{
			var newIndex;
			
			if (this.enabled)
			{
				internal.loader.show();
				
				if (this.index === photos[this.set].length - 1)
				{
					newIndex = 0;
				}
				else
				{
					newIndex = this.index + 1;
				}
            	
				this.index = newIndex;
				this.change();
			}
			return false;
		},
		
		prev: function ()
		{
			var newIndex;
			
			if (this.enabled)
			{
				internal.loader.show();
				
				if (this.index === 0)
				{
					newIndex = photos[this.set].length - 1;
				}
				else
				{
					newIndex = this.index - 1;
				}
				
				this.index = newIndex;
				this.change();
			}
			return false;
		},
		
		controls: {
			
			init: function ()
			{
				$('#prev-btn').click($.proxy(internal.slideshow, 'prev'));
				$('#next-btn').click($.proxy(internal.slideshow, 'next'));
			},
			
			hide: function ()
			{
				$('#transport-controls').hide();
			},
			
			show: function ()
			{
				$('#transport-controls').show();
			}
		}
	}
	
	// Take an array of photo object, sort them by their set name
	// then create multiple objects grouped by the name
	// Object created example:
	// photos['childhood']
	internal.organizePhotos = function (photos)
	{
		var sorted = photos.sort(function (a, b)
			{
				var setA = a.set.toLowerCase(),
					setB = b.set.toLowerCase(),
					sort = 0;
				
				if (setA < setB)
				{
					sort = -1;
				}
				else if (setA > setB)
				{
					sort = 1;
				}
				else
				{
					sort = 1;
				}
				
				return sort;
			}),
			
			prevSet = null,
			
			org = {};
			
		$.each(sorted, 
			function (i, p)
			{
				if (p.set !== prevSet)
				{
					if (prevSet !== null)
					{
						org[prevSet].sort();
					}
					
					org[p.set] = [];
				}
				
				org[p.set].push(p.url);
				
				// Sort the last set on the way out
				if (i === sorted.length - 1)
				{
					org[p.set].sort();
				}
				
				prevSet = p.set;
			}
		);
		
		return org;
	};
	
	// Base URL for all API data
	this.apiBaseUrl = 'http://mycoffeespoon/api/';
	
	// Retrieve an absolute URL to an API resource
	// @param STRING urlName - The name of the resourse
	// @return STRING - The url
	this.url = function (resource)
	{	
		var urls = {
				'sets': 'sets.json',
				'photos': 'photos.json'
			};
		
		return this.apiBaseUrl + urls[resource];
	};
	
	this.init = function ()
	{		
		this.loadData(this.url('sets'),
			function (data)
			{
				sets = data.sets;
				
				$this.loadData($this.url('photos'),
					function (data)
					{
						photos = internal.organizePhotos(data.photos);
						$this.allDataLoaded();
					}
				);
			}
		);
	};
	
	// Once all data is loaded we can initialize the UI elements
	this.allDataLoaded = function ()
	{
		internal.navigation.init();
		internal.slideshow.init();
	}
	
	// Wrapper method for resource Ajax requests
	// @param STRING url - The resource url
	// @param FUNC onComplete - Will be passed the data from a successful request
	this.loadData = function (url, onComplete)
	{		
		$.ajax({
			url: url,
			type: 'GET',
			dataType: 'json',
			success: function (data)
			{
				onComplete(data);
			}
		});
	};
	
	this.init();
};

$(document).ready(
	function ()
	{
		CP();
	}
);