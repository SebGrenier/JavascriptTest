function FilterJSONArray( CriteriaFn )
{
	return function( Element, Index, Array )
	{
		return CriteriaFn( Element, Index, Array );
	};
}

function FindPropertyInArray( TheArray, PropertyName, PropertyValue )
{
    for( var i = 0; i < TheArray.length; ++i )
    {
        if( TheArray[i].hasOwnProperty( PropertyName ) )
        {
            if( TheArray[i][PropertyName] === PropertyValue )
                return TheArray[i];
        }
    }
    return undefined;
}

app.controller( "STLFavsController", function( $scope, $http )
{
	// Initialize initial values
	$scope.Agencies = [];
	$scope.CurrentAgency = null;
	$scope.ShowAgencyInfo = false;
	$scope.Routes = [];
	$scope.CurrentRoute = null;
	$scope.ShowRouteInfo = false;
	$scope.Trips = [];
	$scope.StopTimes = [];
	$scope.Stops = [];
	$scope.CurrentTrips = [];
	$scope.CurrentStops = [];
	$scope.CurrentStop = null;
	$scope.ShowStopInfo = false;
	
	// Read agency JSON
    $http.get( "data/agency.json" )
    .success( function( response )
	{
        $scope.Agencies = response;
        console.log( "agency.json loaded" );
	});
	
	// Read routes JSON
	$http.get( "data/routes.json" )
	.success( function( response )
	{
	    TempRoutes = response;
	    console.log( "routes.json loaded" );
		
		// Get only the routes that are for January 15
		var IsJan15 = FilterJSONArray( function( Element )
		{
			if( Element.hasOwnProperty( "route_id" ) )
			{
				//console.log( "route_id value is : " + Element.route_id );
				return Element.route_id.startsWith( "JANV15" );
			}
			else
			{
				console.log( "Object has no property route_id" );
				return false;
			}
		});
		
		$scope.Routes = TempRoutes.filter( IsJan15 );
		$scope.Routes.sort( function( ElemA, ElemB )
		{
		    if( ElemA.hasOwnProperty( "route_short_name" ) && ElemB.hasOwnProperty( "route_short_name" ) )
		    {
		        // Test for short names, then long names

		        // Short names should be integer
		        ElemAShort = Number( ElemA.route_short_name );
		        ElemBShort = Number( ElemB.route_short_name );

		        if( ElemAShort < ElemBShort )
		        {
		            return -1;
		        }
		        else if( ElemAShort > ElemBShort )
		        {
		            return 1;
		        }
		        else
		        {
		            if( ElemA.hasOwnProperty( "route_long_name" ) && ElemB.hasOwnProperty( "route_long_name" ) )
		            {
		                if( ElemA.route_long_name < ElemB.route_long_name )
		                {
		                    return -1;
		                }
		                else if( ElemA.route_long_name > ElemB.route_long_name )
		                {
		                    return 1;
		                }
		                else
		                {
		                    return 0;
		                }
		            }
		        }
		    }
		    return 0;
		});
	} );

    // Read trips JSON
	$http.get( "data/trips.json" )
    .success( function( response )
    {
        $scope.Trips = response;
        console.log( "trips.json loaded" );
    } );

    // Read stop_times JSON
	$http.get( "data/stop_times.json" )
    .success( function( response )
    {
        $scope.StopTimes = response;
        console.log( "stop_times.json loaded" );
    } );

    // Read stops JSON
	$http.get( "data/stops.json" )
    .success( function( response )
    {
        $scope.Stops = response;
        console.log( "stops.json loaded" );
    } );
	
	// Function when selecting an agency
	$scope.OnAgencySelect = function( )
	{
		if( $scope.CurrentAgency != null ||
			$scope.CurrentAgency != undefined )
		{
			$scope.ShowAgencyInfo = true;
		}
		else
		{
			$scope.ShowAgencyInfo = false;
		}
	};
	
	$scope.OnRouteSelect = function( )
	{
	    if( $scope.CurrentRoute != null ||
			$scope.CurrentRoute != undefined )
	    {
	        $scope.ShowRouteInfo = true;

	        // Use the route ID to get all the trips of this route
	        var FilterTrips = FilterJSONArray( function( Element )
	        {
	            if( Element.hasOwnProperty( "route_id" ) )
	            {
	                return Element.route_id === $scope.CurrentRoute.route_id;
	            }
	            return false;
	        } );

	        $scope.CurrentTrips = $scope.Trips.filter( FilterTrips );

	        if( $scope.CurrentTrips.length <= 0 )
	        {
	            console.log( "No trips for route " + $scope.CurrentRoute.route_short_name + " " + $scope.CurrentRoute.route_long_name );
	            return;
	        }

	        // Select the first trip to get the list of stops (they should have the same stops)
	        var Trip = $scope.CurrentTrips[0];
	        var TripID = Trip.trip_id;

	        var FilterStopTimes = FilterJSONArray( function( Element )
	        {
	            if( Element.hasOwnProperty( "trip_id") )
	            {
	                return Element.trip_id === TripID;
	            }
	            return false;
	        } );

	        var StopTimes = $scope.StopTimes.filter( FilterStopTimes );
	        var StopIDs = StopTimes.map( function( Element )
	        {
	            return Element.stop_id;
	        } );

	        // Find each stop IN ORDER
	        $scope.CurrentStops = [];
	        StopIDs.forEach( function( Value )
	        {
	            // Find the stop in the stops array
	            var TheStop = FindPropertyInArray( $scope.Stops, "stop_id", Value );
	            if( TheStop != undefined )
	            {
                    $scope.CurrentStops.push( TheStop );
	            } 
	        } )
	    }
	    else
	    {
	        $scope.ShowRouteInfo = false;
	    }
	};

	$scope.OnStopSelect = function()
	{
	    $scope.ShowStopInfo = $scope.CurrentStop != null;
	}
});