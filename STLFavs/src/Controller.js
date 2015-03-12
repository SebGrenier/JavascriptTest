function FilterJSONArray( CriteriaFn )
{
	return function( Element, Index, Array )
	{
		return CriteriaFn( Element, Index, Array );
	};
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
	
	// Read agency JSON
    $http.get( "data/agency.json" )
    .success( function( response )
	{
		$scope.Agencies = response;
	});
	
	// Read routes JSON
	$http.get( "data/routes.json" )
	.success( function( response )
	{
		TempRoutes = response;
		
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
	});
	
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
		}
		else
		{
			$scope.ShowRouteInfo = false;
		}
	}
});