#!/usr/bin/env python

import argparse
import os.path
import codecs

def ParseArgs( ) :
	parser = argparse.ArgumentParser( description='Convert a GFT file to JSON format.' )
	
	parser.add_argument( 'FileNames', nargs='+', type=str,
						 help="Input files to convert to JSON format. 1 or more files supported." )

	args = parser.parse_args( )
	
	return args
	
def WriteJSON( ObjectList, FileName ) :
	# Open a file for writing
	with codecs.open( FileName, 'w', 'utf_8' ) as File :
		# Write the array start '['
		File.write( "[\n" )
		
		# Lets suppose ObjectList is an array
		if len( ObjectList ) > 0 :
			First = True
			for ObjDict in ObjectList :
				# Write a comma if you are not the first element
				if not First :
					File.write( "," )
				else :
					First = False
					
				# Write the starting object '{'
				File.write( "{\n" )
				
				# Write the property-value pairs inside the dictionary
				FirstProperty = True
				for ( key, value ) in ObjDict.items( ) :
					# Write a tab to indent
					File.write( "\t" )
					
					# Write a comma if you are not the first propery
					if not FirstProperty :
						File.write( "," )
					else :
						FirstProperty = False
						
					File.write( '"%s" : "%s"\n' % ( key, value ) )
				
				# Write the ending '}'
				File.write( "}\n" )
		
		# Write the array end "]"
		File.write( "]\n" )

def ConvertFile( FileName ) :
	# Check if the path exists
	if not os.path.exists( FileName ) :
		print "File '%s' does not exists." % FileName
		return
	
	# Check the encoding the of the file. GTFS files
	# are encoded using UTF-8 with possibly a BOM character
	MinByteSize = min( 32, os.path.getsize( FileName ) )
	Raw = open( FileName, 'rb').read( MinByteSize )
	
	if Raw.startswith( codecs.BOM_UTF8 ):
		Encoding = 'utf_8_sig'
	else:
		Result = chardet.detect( Raw )
		Encoding = result['encoding']
		
	print "Converting %s..." % FileName
	
	Lines = []
	with codecs.open( FileName, 'r', encoding=Encoding ) as File :
		# Read all the lines
		Lines = File.readlines( )
	
	if len( Lines ) <= 1 :
		print "File %s is empty or has no info." % FileName
		return
	
	# Check the first line to get the name of each property
	Properties = Lines[ 0 ].rstrip( "\r\n" ).split( ',' )
	
	ObjectList = []
	
	# For each line, build a dictionary and push it in the object list
	for i in range( 1, len( Lines ) ) :
		Values = Lines[ i ].rstrip( "\r\n" ).split( ',' )
		ObjDict = dict( zip( Properties, Values ) )
		ObjectList.append( ObjDict )
		
	
	# Write the object list as a JSON file
	BaseName = os.path.splitext( FileName )[ 0 ]
	JSONName = BaseName + ".json"
	WriteJSON( ObjectList, JSONName )
	
	print "Converting %s... Done" % FileName
	
	
def Run( ) :
	Args = ParseArgs( )
	
	if Args.FileNames is None :
		raise SystemExit( "FileNames undefined" )
		
	for FileName in Args.FileNames :
		ConvertFile( FileName )


if __name__ == "__main__" :
	Run( )