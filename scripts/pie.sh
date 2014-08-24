#!/bin/bash
BASEDIR=$(dirname $0)
cd $BASEDIR
cd ../jQuery

# Requires lessc and brwoserify in path.  You can get both by doing npm install -g lessc, npm install -g browserify

for ff in pie.*.less
do
  lessc $ff > ../dist/$(basename $ff .less).min.css 
done &&

echo "[" $(echo $(ls pie.*.less | sed 's/.less//g' | awk '{printf("\"%s\" ", $1);}') | tr ' ' ',') "]" > themes.json &&
browserify -o ../dist/pie.gen.js  pie.js &&
rm themes.json &&

for ff in pie.*.less 
do
    echo "[" $(echo $ff | sed 's/.less//g' | awk '{printf("\"%s\"", $1); }') "]" > themes.json &&
    browserify -o ../dist/$(basename $ff .less).js pie.js &&
    rm themes.json
done &&

if [ ! -f ../pages/vendor/jQuery.js ]; then
  mkdir -p ../pages/vendor &&
  curl -o ../pages/vendor/jQuery.js http://code.jquery.com/jquery-1.11.1.min.js
fi &&

echo finished.


