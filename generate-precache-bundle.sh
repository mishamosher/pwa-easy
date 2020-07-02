#!/bin/sh

# Generates a ZIP of the contents of the site. Keep reading to know which files are included/excluded.
# The ZIP is then put in a Workbox precache manifest and embedded in the second line of service-worker.js
# An expanded cache manifest of every file in the ZIP is embedded in the second line of service-worker.js

# This script requires some utilities that generally are not installed by default: zip zipnote sponge
# Can be found on those packages: zip moreutils

sum2Bundle() {
  awk -F "\n" '{ i=index($1, " "); printf "const precacheBundle = {url: '\''" substr($1, i + 4) "'\'', revision: '\''" substr($1, 1, i - 1) "'\''};\n" }'
}

generateSum() {
  xargs -0 -n1 sha384sum -b
}

digestFile() {
  sha384sum -b "$1" | awk '{ printf $1 }'
}

digestString() {
  printf "%s" "$1" | sha384sum -b | awk '{ printf $1 }'
}

# Generate file list
{
  # All the minified JS and CSS files in the external folder
  find . -type f -iwholename "./external/js/*.min.js" -print
  find . -type f -iwholename "./external/css/*.min.css" -print
  # Workbox is an edge case because minified files end with [.prod.(js|mjs)], and one file, workbox-sw.js, is minified-only
  find ./external/js/global/workbox/ -type f \( -iwholename "*.prod.js" -o -iwholename "*.prod.mjs" \) -print
  echo './external/js/global/workbox/workbox-sw.js'
  # Fontawesome webfonts
  # find . -type f -iwholename "./external/css/fontawesome/webfonts/*" -print
  # Openmoji SVGs
  # find . -type f -iwholename "./external/img/openmoji/*.svg" -print

  # Generate precache for all files not under [.idea|files|external|bundle] directories and that don't start with a dot (.)
  # This script and service-worker.js are also omitted
  find . -type d \( -path ./.idea -o -path ./files -o -path ./external -o -path ./bundle \) -prune \
    -o -type f \( -path "$0" -o -path ./service-worker.js -o -iname '.*' \) -prune \
    -o -type f -print
} | sponge bundle/file-list.txt

# Generate hashes for the file list
{
  awk -F "\n" '{ print $1 }' bundle/file-list.txt | tr "\n" "\0" | generateSum
} >bundle/file-list-hashes-new.txt

# If an identical precache hashes list already exists, stop any further work
if [ -e bundle/file-list-hashes.txt ] && [ "$(digestFile bundle/file-list-hashes.txt)" = "$(digestFile bundle/file-list-hashes-new.txt)" ]; then
  rm -f bundle/file-list-hashes-new.txt
  echo 'No changes detected!'
  exit 0
fi

mv -f bundle/file-list-hashes-new.txt bundle/file-list-hashes.txt

# Cleanup
rm -f bundle/precache*

zip -q -9 -@ bundle/precacheFiles.zip <bundle/file-list.txt

# Generate a Workbox precache manifest from the file list hashes.
{
  printf 'const precacheList=['
  # For the "pretty URLs" to work, ./index.html should be listed as ./
  awk -F "\n" '/^[0-9a-f]+ \*\.\/index\.html$/ { gsub(/index\.html$/, "./") }; { print }' bundle/file-list-hashes.txt |
    # Pipe the output to another awk
    awk -F "\n" '{
i=index($1, " "); hash=substr($1, 1, i - 1); file=substr($1, i + 4);
printf "{url:'\''" file "'\'',revision:'\''" hash "'\'',integrity:'\''sha384-";
system("printf '\''"hash"'\'' | xxd -r -p | base64 -w 0"); # Convert the hash to base64
printf "'\''},"
}'
  printf '];'
} >bundle/precacheList.js

# Reformat the file list hashes to comply with the format expected by zipnote
{
  awk -F "\n" '{ i=index($1, " "); print "@ " substr($1, i + 4) "\n" substr($1, 1, i - 1) "\n@ (comment above this line)" }' bundle/file-list-hashes.txt
  echo '@ (zip file comment below this line)'
} | sponge bundle/file-list-hashes-zipnote.txt

zipnote -w bundle/precacheFiles.zip <bundle/file-list-hashes-zipnote.txt

HASH_PRECACHE_LIST=$(digestFile 'bundle/precacheList.js')
HASH_BUNDLE_ZIP=$(digestFile 'bundle/precacheFiles.zip')

printf "%s *./bundle/precacheFiles-%s.zip" "$HASH_BUNDLE_ZIP" "$HASH_BUNDLE_ZIP" | sum2Bundle >bundle/precacheBundle.js

mv bundle/precacheFiles.zip "bundle/precacheFiles-$HASH_BUNDLE_ZIP.zip"
mv bundle/precacheList.js "bundle/precacheList-$HASH_PRECACHE_LIST.js"
mv bundle/precacheBundle.js "bundle/precacheBundle-$HASH_BUNDLE_ZIP.js"

# Generate a hash of the expanded precache manifest and embed it into service-worker.js
# If the hash is different, it will trigger an update of service-worker.js in the browser
{
  echo "importScripts('./bundle/precacheBundle-$HASH_BUNDLE_ZIP.js', './bundle/precacheList-$HASH_PRECACHE_LIST.js');"
} |
  # sed two expressions
  #  '2d' to delete the second line
  #  '1r /dev/stdin' to insert the contents of /dev/stdin (piped input) after the first line
  # all the expressions are to be executed sequentially and directly (-i option) on service-worker.js
  sed -i -e '2d' -e '1r /dev/stdin' service-worker.js

echo 'Done!'
