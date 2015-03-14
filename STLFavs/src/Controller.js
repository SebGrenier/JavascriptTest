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

function FormatDate( TheDate )
{
    if( TheDate instanceof Date )
    {
        // The format is yyyymmdd
        var YearStr = TheDate.getFullYear().toString();

        // The month may be one digit, plus it is 0 based
        var MonthStr = ( TheDate.getMonth() + 1 ).toString();
        if( MonthStr.length < 2 )
        {
            MonthStr = "0" + MonthStr;
        }

        var DayStr = TheDate.getDate().toString();

        return YearStr + MonthStr + DayStr;
    }
    
    return "";
}

app.controller( "STLFavsController", function( $scope, $http, $q )
{
    // Initialize initial values
    $scope.Calendar = [];
    $scope.CalendarDates = [];
    $scope.Agencies = [];
    $scope.CurrentAgency = null;
    $scope.ShowAgencyInfo = false;
    $scope.AllRoutes = [];
    $scope.ValidRoutes = [];
    $scope.CurrentRoute = null;
    $scope.ShowRouteInfo = false;
    $scope.Trips = [];
    $scope.StopTimes = [];
    $scope.Stops = [];
    $scope.CurrentTrips = [];
    $scope.CurrentStops = [];
    $scope.CurrentStop = null;
    $scope.ShowStopInfo = false;
    $scope.ServiceID = "";
    $scope.ServicePrefix = "";

    // Load both calendar JSONs
    GetCalendar = $http.get( "data/calendar.json", { cache: false } );
    GetCalendarDates = $http.get( "data/calendar_dates.json", { cache: false } );

    $q.all( [GetCalendar, GetCalendarDates] ).then( function( values )
    {
        // Get the data of the values returned
        $scope.Calendar = values[0].data;
        $scope.CalendarDates = values[1].data;
        console.log( "Loaded both calendar JSONs" );

        // Get the current date
        var CurrentDate = new Date();
        var DateStr = FormatDate( CurrentDate );

        // Check the exception dates first
        var FilterExceptionDates = FilterJSONArray( function( Element )
        {
            if( Element.hasOwnProperty( "date" ) )
            {
                return Element.date === DateStr;
            }
            return false;
        } );

        var ExceptionDates = $scope.CalendarDates.filter( FilterExceptionDates );

        // If there is at least one (can there be more that one?), use this service id instead
        if( ExceptionDates.length > 0 )
        {
            $scope.ServiceID = ExceptionDates[0].service_id;

            // We should also check for the type of exception, i.e.
            // if this is a day WITHOUT service.
        }
        else
        {
            // We have to check inside the calendar for a service that match
            // our current date
            var FilterDates = FilterJSONArray( function( Element )
            {
                if( Element.hasOwnProperty( "start_date" ) &&
                    Element.hasOwnProperty( "end_date" ) )
                {
                    return DateStr >= Element.start_date && DateStr <= Element.end_date;
                }
                return false;
            } );

            var PossibleDates = $scope.Calendar.filter( FilterDates );
            if( PossibleDates.length <= 0 )
            {
                console.log( "No suitable date found in the calendar" );
                return;
            }

            // Find the correct service, i.e. week service or weekend
            var DayStrArray = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            var TheDates = PossibleDates.filter( function( Element )
            {
                // Lets assume that the element is indeed a date from the calendar
                var CurrentDayInt = CurrentDate.getDay();
                
                // Check if the value of the property corresponding to this day is 1
                return Element[DayStrArray[CurrentDayInt]] === "1";
            } )

            // Hope there is only one date
            if( TheDates.length > 0 )
            {
                $scope.ServiceID = TheDates[0].service_id;
            }
        }
        
    } );

    // Read agency JSON
    $http.get( "data/agency.json" )
    .success( function( response )
    {
        $scope.Agencies = response;
        console.log( "agency.json loaded" );
    } );

    // Read routes JSON
    $http.get( "data/routes.json" )
	.success( function( response )
	{
	    $scope.AllRoutes = response;
	    console.log( "routes.json loaded" );

	    
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
    $scope.OnAgencySelect = function()
    {
        if( $scope.CurrentAgency != null ||
			$scope.CurrentAgency != undefined )
        {
            // Select the valid routes only
            // Filter agency
            var FilterAgency = FilterJSONArray( function( Element )
            {
                if( Element.hasOwnProperty( "agency_id" ) )
                {
                    return Element.agency_id === $scope.CurrentAgency.agency_id;
                }
                return false;
            } )
            var TempValidRoutes = $scope.AllRoutes.filter( FilterAgency );

            // Filter the route_id based on the service prefix
            var FilterServicePrefix = FilterJSONArray( function( Element )
            {
                if( Element.hasOwnProperty( "route_id" ) )
                {
                    return Element.route_id.startsWith( $scope.ServicePrefix );
                }
                return false;
            } );
            $scope.ValidRoutes = TempValidRoutes.filter( FilterServicePrefix );

            // Sort the valid routes
            $scope.ValidRoutes.sort( function( ElemA, ElemB )
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
            } );

            // Set show to true only at the end, when everything has been
            // properly set
            $scope.ShowAgencyInfo = true;
        }
        else
        {
            $scope.ShowAgencyInfo = false;
        }
    };

    // Function when selecting a route
    $scope.OnRouteSelect = function()
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
                if( Element.hasOwnProperty( "trip_id" ) )
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

    // Function when selecting a stop
    $scope.OnStopSelect = function()
    {
        $scope.ShowStopInfo = $scope.CurrentStop != null;

        if( $scope.ShowStopInfo )
        {
            // Find the schedule for this stop, 
            // taking into account the day of the week
            var StopID = $scope.CurrentStop.stop_id;

            // Get the stop times for current stop
            var FilterStopTimes = FilterJSONArray( function( Element )
            {
                if( Element.hasOwnProperty( "stop_id" ) )
                {
                    return Element.stop_id === StopID;
                }
                return false;
            } );
            var CurrentStopTimes = $scope.StopTimes.filter( FilterStopTimes );


        }
    }

    // Watches
    $scope.$watch( "ServiceID", function()
    {
        console.log( "Service ID is : " + $scope.ServiceID );

        // Compute the new ServicePrefix
        var PrefixRegex = /([a-zA-Z]+\d{2})/i;
        var Match = PrefixRegex.exec( $scope.ServiceID );
        if( Match != null )
        {
            $scope.ServicePrefix = Match[0];
        }
        console.log( "Service Prefix is : " + $scope.ServicePrefix );
    } )
} );