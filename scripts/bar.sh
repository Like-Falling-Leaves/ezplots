#!/bin/bash
BASEDIR=$(dirname $0)
cd $BASEDIR
cd ../jQuery

# Requires lessc and brwoserify in path.  You can get both by doing npm install -g lessc, npm install -g browserify

for ff in bar.*.less
do
  lessc $ff > ../dist/$(basename $ff .less).min.css 
done &&

echo "[" $(echo $(ls bar.*.less | sed 's/.less//g' | awk '{printf("\"%s\" ", $1);}') | tr ' ' ',') "]" > themes.json &&
browserify -o ../dist/bar.gen.js  bar.js &&
rm themes.json &&

for ff in bar.*.less 
do
    echo "[" $(echo $ff | sed 's/.less//g' | awk '{printf("\"%s\"", $1); }') "]" > themes.json &&
    browserify -o ../dist/$(basename $ff .less).js bar.js &&
    rm themes.json
done &&

if [ ! -f ../pages/vendor/jQuery.js ]; then
  mkdir -p ../pages/vendor &&
  curl -o ../pages/vendor/jQuery.js http://code.jquery.com/jquery-1.11.1.min.js
fi &&

echo "[]" > themes.json &&
browserify -o ../dist/bar.html.js ../pages/bar.html.js &&
rm themes.json &&

for ff in bar.*.less
do
  cat > /tmp/$(basename $ff .less).jade <<EOF
doctype html
head
  meta(charset="utf-8")
  meta(http-equiv="X-UA-Compatible", content="IE=edge")
  title= 'EZ Plot: Bar'
  meta(name="description", content="The simplest charting solution")
  meta(name="viewport", content="width=device-width, initial-scale=1")
  link(id="$(basename $ff .less | tr '.' '_')", href="$(basename $ff .less).min.css", rel="stylesheet")
body
  script(src="bar.html.js")
EOF
  jade /tmp/$(basename $ff .less).jade -o ../dist
done &&

echo finished.



