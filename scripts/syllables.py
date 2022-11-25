from bs4 import BeautifulSoup
from transliterate import translit
import requests
import unidecode
import unicodedata
import os

greek_words = []

def rmdiacritics(char):
    '''
    Return the base character of char, by "removing" any
    diacritics like accents or curls and strokes and the like.
    '''
    desc = unicodedata.name(char)
    cutoff = desc.find(' WITH ')
    if cutoff != -1:
        desc = desc[:cutoff]
        try:
            char = unicodedata.lookup(desc)
        except KeyError:
            pass  # removing "WITH ..." produced an invalid name
    return char

def scour(url = 'https://en.wiktionary.org/wiki/Category:Ancient_Greek_2-syllable_words'):
    page = requests.get(url)
    soup = BeautifulSoup(page.text, 'html.parser')
    for group in soup.find_all("div", {"class": "mw-category-group"}):
        for li in group.find_all('li'):
            a = li.find_all('a')
            if len(a) > 0:
                greek_words.append(a[0].text)

    anext = soup.find_all('a', text='next page')
    if len(anext) > 0:
        scour('https://en.wiktionary.org' + anext[0]['href'])

if os.path.exists('greek.txt'):
    with open("greek.txt", "r") as greek_file:
    	greek_words = greek_file.read().splitlines()
else:
    scour()

# print('\n'.join(greek_words))
# print('Got %s words' % len(greek_words))

latin_words = []
for greek_word in greek_words:
    clean_word = ''.join(rmdiacritics(c) for c in greek_word)
    latin_word = translit(clean_word, 'el', reversed=True)
    latin_word = latin_word.lower()
    print(latin_word)
