import sys
import re
import subprocess
import json
import os
import argparse

sid_re = re.compile('exports ([0-9]+) as "([^"]+)"')
smap_re = re.compile('Push String:"(S[^"]+)".*String:"(A[^"]+)"')
actionstring_re = re.compile('Push String:"_(?P<key>.+)" String:"(?P<value>.+)"')
def extract_assets(dat_filename, outpath):
    question = {'audio': {}}
    swfdump_args = ['swfdump', '-a', dat_filename]
    swfdump_process = subprocess.run(swfdump_args, stdout=subprocess.PIPE, encoding='utf-8', check=True)
    swfdump = swfdump_process.stdout
    for swfdump_line in swfdump.split('\n'):
        # extract audio information
        sid = sid_re.search(swfdump_line)
        if (sid):
            sound_id = sid.group(1)
            sound_name = sid.group(2)
            question['audio'][sound_name] = (sound_id,)
        else:
            smap = smap_re.search(swfdump_line)
        if (smap):
            sound_name = smap.group(1)
            sound_application = smap.group(2)
            (sound_id,) = question['audio'][sound_name]
            question['audio'][sound_name] = (sound_application, sound_id)
        else:
            # extract question texts
            actionstring_match = actionstring_re.search(swfdump_line)
        if (actionstring_match):
            key = actionstring_match.group('key')
            value = actionstring_match.group('value')
            question[key] = value
    for sound_name, appid in question['audio'].items():
        if (len(appid) > 1):
            sound_application, sound_id = appid
        else:
            (sound_id,) = appid
            sound_application = sound_name
        sound_filename = f'{outpath}/{sound_application}.mp3'
        # extract audio file
        if (not os.path.isfile(sound_filename)):
            os.makedirs(outpath, exist_ok=True)
            swfextract_args = ['swfextract', '-o', sound_filename, '-s', sound_id, dat_filename]
            subprocess.run(swfextract_args, check=True)
    question['audio'] = {appid[0]: name for name, appid in question['audio'].items()}
    return question

# if main
parser = argparse.ArgumentParser(description='Extract YDKJ 4 (German Edition) assets.')
parser.add_argument('--input', type=str, required=True, help="Path to installation root. Must contain lib/q/qlist.dat.")
parser.add_argument('--output', type=str, required=True, help="Directory for output.")
parser.add_argument('--max_items', type=int, default=0)
args = parser.parse_args()

input_path_q = args.input+'/lib/q'
if (os.path.isdir(input_path_q)):
    qlist_path = input_path_q+'/qlist.dat'
    with open(qlist_path, 'r') as qlistfile:
        questions = []
        qid_re = re.compile('(?<=id=")[^"]{3}')
        tid_re = re.compile('(?<=t=").')
        for qlistline in qlistfile:
            tid_match = tid_re.search(qlistline)
            qid_match = qid_re.search(qlistline)
            if (tid_match and qid_match):
                tid = tid_match.group(0)
                if (tid != 's'):
                    # only shorties for now
                    continue
                qid = qid_match.group(0)
                dat_filename = f'{input_path_q}/{qid}.dat'
                asset_path = f'{args.output}/{qid}'
                question = extract_assets(dat_filename, asset_path)
                question['t'] = tid
                questions.append(question)
                sys.stderr.write('.')
                sys.stderr.flush()
                if (args.max_items and len(questions) >= args.max_items):
                    sys.stderr.write('\nMaximum count of items reached. Stopping prematurely.')
                    break
        sys.stderr.write('\n')
        print(json.dumps(questions, ensure_ascii=False, indent=2))
else:
    print(extract_assets(args.input, args.output))
