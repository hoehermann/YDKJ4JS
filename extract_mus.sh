#!/bin/bash
source="$1"
for i in {1..15}
do
  i=G04I$(printf %02d $i)
  python3 extract_q.py --input "$source"/lib/mus/$i.dat --output mus/$i
done
