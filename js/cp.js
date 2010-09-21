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
		sets     = {},
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
			
			$('header:eq(0) ul').prepend(html.join(''));
		}
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
						photos = data.photos;
						
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