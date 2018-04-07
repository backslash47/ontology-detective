# Alternative Explorer For Ontology Blockchain

## Overview

This is an alternative blockchain explorer for Ontology blockchain. The application is hosted on http://www.ontdetective.org.

## Getting started

#### Install ElasticSearch
Install ElasticSearch according to platform on which it will be used (https://www.elastic.co/guide/en/elasticsearch/reference/current/_installation.html)

#### Enable CORS for ElasticSearch
Add these two lines to elasticsearch.yml configuration file
```
http.cors.enabled: true
http.cors.allow-origin: *
```
#### Run ElasticSearch
Application assumes that elasticsearch is running on http://localhost:9200.
Otherwise environment variable REACT_APP_API_URL should be overriden.

#### Install yarn
For faster building process and development experience install Yarn

```
npm install --global yarn
```

#### Download
```
git clone 'https://github.com/backslash47/ontology-detective.git'
```

#### Start development server
````
yarn start
````

#### Build Ingester
````
yarn buildServer
````

#### Create ElasticSearch mapping
````
yarn mappings
````

#### Start Ingester process
````
yarn ingest
````

#### Create production Build
Edit package.json and change REACT_APP_API_URL to corresponding ElasticSearch address.

````
yarn build
````

#### Production deployment
Built distribution is located in build directory. It can be hosted by any webserver, which is set to rewrite any non asset url to index.html (Apache httpd, Nginx, Amazon S3, Amazon CloudFront, ...).

For production deployment also the ElasticSearch must be guarded by Authentization mechanism.

* [X-Pack](https://www.elastic.co/products/x-pack) Official ElasticSearch paid option
* [ReadonlyRest](https://readonlyrest.com/) Unofficial free option
* [Amazon ElasticSearch](https://aws.amazon.com/elasticsearch-service/) Amazon authentization


## Built With

* [TypeScript](https://www.typescriptlang.org/) - Used language
* [Node.js](https://nodejs.org) - JavaScript runtime for building and ingest
* [React](https://reactjs.org/) - The web framework used
* [Semantic UI](https://react.semantic-ui.com/introduction) - The web framework used
* [Elasticsearch](https://www.elastic.co/) - Backend data storage and indexer
* [Ontology TypeScript SDK](https://github.com/ontio/ontology-ts-sdk) - The framework used

## Authors

* **Matus Zamborsky** - *Initial work* - [Backslash47](https://github.com/backslash47)

## License

This project is licensed under the LGPL License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

Many thanks to the whole Ontology team, who done a great job bringing Ontology to life.