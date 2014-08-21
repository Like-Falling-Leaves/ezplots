#!/bin/bash
BASEDIR=$(dirname $0)
cd $BASEDIR
cd ../dist

# set S3_CFG to where your S3CMD config file is stored -- typicallt ~/.s3cfg
# set S3_PATH to the s3 path where you want static resource files to go onto.
#    This could be something like s3://yourbucket/assets/

echo $S3_PATH
for ff in *.js
do
   cp $ff /tmp/$ff &&
   gzip -9f /tmp/$ff &&
   s3cmd -c $S3_CFG --acl-public --add-header="Cache-control:max-age=3600" --add-header="content-encoding: gzip" -m text/javascript put /tmp/$ff.gz $S3_PATH$ff &&
   rm /tmp/$ff.gz
done &&

for ff in *.css
do
   cp $ff /tmp/$ff &&
   gzip -9f /tmp/$ff &&
   s3cmd -c $S3_CFG --acl-public --add-header="Cache-control:max-age=3600" --add-header="content-encoding: gzip" -m text/css put /tmp/$ff.gz $S3_PATH$ff &&
   rm /tmp/$ff.gz
done &&

for ff in *.html
do
   cp $ff /tmp/$ff &&
   gzip -9f /tmp/$ff &&
   s3cmd -c $S3_CFG --acl-public --add-header="Cache-control:max-age=3600" --add-header="content-encoding: gzip" -m text/html put /tmp/$ff.gz $S3_PATH$ff &&
   s3cmd -c $S3_CFG --acl-public --add-header="Cache-control:max-age=3600" --add-header="content-encoding: gzip" -m text/html put /tmp/$ff.gz $S3_PATH$(basename $ff .html) &&
   rm /tmp/$ff.gz
done
