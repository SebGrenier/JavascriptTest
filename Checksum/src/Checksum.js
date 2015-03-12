var k = [0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee ,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501 ,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be ,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821 ,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa ,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8 ,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed ,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a ,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c ,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70 ,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05 ,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665 ,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039 ,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1 ,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1 ,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391];
	
var r = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
	
function DigestToString( Digest )
{
	// Check if the digest is 16 elements long
	if( Digest.length != 16 )
	{
		return "";
	}
	
	var DigestStrArr = Digest.map( function( Val ){
		return Val.toString( 16 );
	});
	
	var DigestStr = DigestStrArr.join( "" );
	
	return DigestStr;
}

function ToBytes( Val )
{
	// Convert value to 32 bits
	Val32 = Val & 0xffffffff;
	Bytes = [0, 0, 0, 0]
    Bytes[ 0 ] = Val32 & 0xff;
    Bytes[ 1 ] = (Val32 >> 8) & 0xff;
    Bytes[ 2 ] = (Val32 >> 16) & 0xff;
    Bytes[ 3 ] = (Val32 >> 24) & 0xff;
}

function ToUInt32( Bytes )
{
	var UInt32 = 0;
	
	if( Bytes.length < 4 )
		return UInt32;
		
	UInt32 = Bytes[ 0 ] | (Bytes[ 1 ] << 8) | (Bytes[ 2 ] << 16) | (Bytes[ 3 ] << 24)
		
    return UInt32;
}

function LeftRotate( Val, Shift )
{
	// Operate on 32 bits
    var UpSample = (Val << Shift) & 0xffffffff;
    var DownSample = (Val >> ( 32 - Shift )) & 0xffffffff;
    return UpSample | DownSample;
}

function ToMD5Hash( Value )
{
	console.log( "Inside ToMD5Hash with value " + Value );
	
	// Make sure Value is a string
	var ValueStr = Value.toString( );
	
	if( ValueStr === undefined || ValueStr.length <= 0 )
	{
		console.log( "Returning empty string in ToMD5Hash" );
		return ""
	}
	
	var HashVals = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
	
	// Transform the string into a array of byte
	var InitialMsg = ValueStr.map( function( x ){
		return x.charCodeAt(0);
	});
    var InitialLength = ValueStr.length;
    

    var NewLength = 0;
	var Offset = 0;
    var w = [];
	for( var i = 0; i < 16; ++i )
	{
		w.push( 0 );
	}
    var a, b, c, d, f, g, temp;
    
    // Pre-processing:
    // append "1" bit to message    
    // append "0" bits until message length in bits ≡ 448 (mod 512)
    // append length mod (2^64) to message
    for( NewLength = InitialLength + 1; Math.floor( NewLength % 64 ) != 56; ++NewLength)
    {
        // Do nothing else than loop post process
    }
    var NewMsg = [ ];
    for( var i = 0; i < InitialLength; ++i )
    {
        NewMsg.push( InitialMsg[ i ] );
    }
    NewMsg.push( 0x80 ); // append the "1" bit; most significant bit is "first"
    for( Offset = InitialLength + 1; Offset < NewLength; ++Offset )
    {
        NewMsg.push( 0 ); // append "0" bits
    }
    
    // append the len in bits at the end of the buffer.
    var TempBytes = ToBytes( InitialLength * 8 );
	NewMsg.concat( TempBytes );
    // initial_len>>29 == initial_len*8>>32, but avoids overflow.
    TempBytes = ToBytes( InitialLength >> 29 );
	NewMsg.concat( TempBytes );
    
    // Process the message in successive 512-bit chunks:
    //for each 512-bit chunk of message:
    for( Offset = 0; Offset < NewLength; Offset += 64 )
    {
        // break chunk into sixteen 32-bit words w[j]
        for( var i = 0; i < 16; ++i )
		{
			var NewMsgBytes = [0, 0, 0, 0];
			for( var j = 0; j < 4; ++j )
			{
				NewMsgBytes[ j ] = NewMsg[ Offset + i * 4 + j ];
			}
            w[i] = ToUInt32( NewMsgBytes );
		}
        
        // Initialize hash value for this chunk:
        a = HashVals[ 0 ];
        b = HashVals[ 1 ];
        c = HashVals[ 2 ];
        d = HashVals[ 3 ];
        
        // Main loop:
        for( var i = 0; i < 64; ++i )
        {
            if( i < 16 ) 
            {
                f = ( b & c ) | ( ( ~b ) & d );
                g = i;
            } 
            else if( i < 32 )
            {
                f = ( d & b ) | ( ( ~d ) & c );
                g = ( 5 * i + 1 ) % 16;
            }
            else if( i < 48 )
            {
                f = b ^ c ^ d;
                g = ( 3 * i + 5 ) % 16;          
            }
            else
            {
                f = c ^ ( b | ( ~d ) );
                g = ( 7 * i ) % 16;
            }
            
            temp = d;
            d = c;
            c = b;
            b = b + LeftRotate( ( a + f + k[ i ] + w[ g ] ), r[ i ] );
            a = temp;
            
        }
        
        // Add this chunk's hash to result so far:
        HashVals[ 0 ] += a;
        HashVals[ 1 ] += b;
        HashVals[ 2 ] += c;
        HashVals[ 3 ] += d;
    }
    
	// Convert the Hashval to bytes, then to string
	var Bytes0 = ToBytes( HashVals[ 0 ] );
	var Bytes1 = ToBytes( HashVals[ 1 ] );
	var Bytes2 = ToBytes( HashVals[ 2 ] );
	var Bytes3 = ToBytes( HashVals[ 3 ] );
	
	var Digest = [].concat( Bytes0, Bytes1, Bytes2, Bytes3 );
	
	return DigestToString( Digest );
}