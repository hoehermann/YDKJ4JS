#!/bin/bash
source="$1"
for g in 20 28 29 
dst=gen/C/c$g
mkdir -p $dst
for i in "${source}"/lib/gen/C/c$g/*.dat
do 
  cp $i ${dst}/$(basename $i .dat).mp3
done
