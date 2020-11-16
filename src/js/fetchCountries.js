import { error } from '@pnotify/core';

import countryCardTpl from '../templates/countryCard.hbs';
import countryListTpl from '../templates/countryList.hbs';


const debounce = require('lodash.debounce');

const baseUrl = 'https://restcountries.eu/rest/v2/name/';

const inputRef = document.querySelector('.form-input');
const resultRef = document.querySelector('.search-result');
const fullName = '?fullText=true';



function getRestData(countryName) {
    resultRef.textContent = countryName;

    const searchQuery = false
         ? baseUrl + countryName + fullName
        : baseUrl + countryName;

    return fetch(searchQuery).then(response => {
        if (response.ok || response.status === 404) return response.json();
        throw new Error('Error fetching data');
    });
}

function searchData(event) {
    removeError();

  const countryName = event.target.value.trim();
  if (countryName.length === 0) return clearResult();
  fetchData(countryName);
}

function operateData(data) {
    clearResult();

    if (data.message) return showError(data.message);

  if (data.length > 10)
    return showError('Too many matches found. Please enter more specific query');
  if (data.length === 1) return (resultRef.innerHTML = countryCardTpl(data));
  if (data.length > 1) resultListListener(data);
}

function clearResult() {
  resultRef.innerHTML = '';
  removeError();
}

function removeError() {
  const errorRef = document.querySelector('.error');
  if (errorRef) errorRef.remove();
}

function resultListListener(data) {
  resultRef.innerHTML = countryListTpl(data);
  const listRef = document.querySelector('.country-list');
  listRef.addEventListener('click', resultListenToFetch, { once: true });
}

function resultListenToFetch(event) {
  inputRef.value = event.target.textContent;
  fetchData(inputRef.value);
}

function fetchData(countryName) {
  return getRestData(countryName)
    .then(operateData)
    .catch(err => {
      error({
        text: `${err}`,
        type: 'error',
      });
    });
}


function showError(err = 'Error') {
    error({
        text: `${err}`,
        type: 'error',
    });
  }

inputRef.addEventListener('input', debounce(searchData, 500));
