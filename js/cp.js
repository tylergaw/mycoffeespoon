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
	
	internal.loadSection = function (sectionInfo)
	{
		var sectionName = sectionInfo.pathNames[0];
		console.log(photos[sectionName][0]);
	};
	
	// Take an array of photo object, sort them by their set name
	// then create multiple objects grouped by the name
	// Object created example:
	// photos['childhood']
	internal.organizePhotos = function (photos)
	{
		var sorted = photos.sort(function (a, b)
			{
				var A = a.set.toLowerCase(),
					B = b.set.toLowerCase(),
					sort = 0;
				
				if (A < B)
				{
					sort = -1;
				}
				else if (A > B)
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