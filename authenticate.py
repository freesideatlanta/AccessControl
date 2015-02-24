import urllib2
import argparse

#this script relies on this file to be at this location, it should be put there by a cron job on the server. 
#The client should be dumb and only "know" about itself. Anything else should be told it via this config file
pathToConfig = '/opt/acConfig.prop';

parser = argparse.ArgumentParser(description="Validate someone's access to a given access point");
parser.add_argument('cardNumber');
parser.add_argument('locationId');
args = parser.parse_args();

cardNum = args.cardNumber;
locationId = args.locationId;

f = open(pathToConfig, 'r');

path = '';
port = '';
serverIp = '';
numberOfRetries = '';

attempts = 0;

for line in f:
	if (line):
		if (line.find('path') > -1):
			path = line.split('=')[1].rstrip();
		elif (line.find('numberOfRetries') > -1):
			numberOfRetries = line.split('=')[1].rstrip();
		elif (line.find('port') > -1):
			port = line.split('=')[1].rstrip();
		elif (line.find('serverIp') > -1):
			serverIp = line.split('=')[1].rstrip();

contactAddress = serverIp + ':' + port + path;
#print contactAddress;
#print numberOfRetries;

def attemptAuth(url):
	global attempts
	global cardNum
	global locationId
	while attempts < int(numberOfRetries):
		try:
			#print "attempts <= numberOfRetries: {0}".format(attempts <= numberOfRetries);
			#print 'attempting to contact ' + url;
			#print "try number {0}".format(attempts);
			urlToAttempt = 'http://' + url + '?cardNumber=' + cardNum + '&locationId=' + locationId;
			#print urlToAttempt;
			returnVal = urllib2.urlopen(urlToAttempt).read();
			#print returnVal;
			if (returnVal == 'true'):
				#print 'true response';
				return True;
			elif (returnVal == 'false'):
				#print 'false response';
				return False;
		except urllib2.URLError:
			pass
		attempts = attempts + 1;
	return None;
	
result = attemptAuth(contactAddress);
attempts = 0;
if (result is not None):
	print 1;
else:
	contactAddress = 'localhost:8080' + path;
	#print 'attempting local authentication: ' + contactAddress;
	localResult = attemptAuth(contactAddress);
	#print localResult
	if (localResult is False or localResult is None):
		#failure case
		print 0;
	else:
		print 1;