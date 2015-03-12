function PrintBobByID( IdStr )
{
	var DocElem = document.getElementById( IdStr );
	if( DocElem != null )
	{
		DocElem.innerHTML = "Bobby";
		DocElem.style.color = "red";
		DocElem.style.fontSize = "40px";
		console.log("Bobby MOTHAFUCKA!");
	}
	else
	{
		console.log("Error : Could not find document element.");
	}
}