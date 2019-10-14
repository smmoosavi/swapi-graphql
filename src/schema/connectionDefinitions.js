// source: graphql-relay/lib/connection/connection.js

import {GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from "graphql";

function resolveMaybeThunk(thingOrThunk) {
  return typeof thingOrThunk === 'function' ? thingOrThunk() : thingOrThunk;
}

/**
 * Returns a GraphQLObjectType for a connection with the given name,
 * and whose nodes are of the specified type.
 */
function connectionDefinitions(config) {
  var nodeType = config.nodeType;

  var name = config.name || nodeType.name;
  var edgeFields = config.edgeFields || {};
  var connectionFields = config.connectionFields || {};
  var resolveNode = config.resolveNode;
  var resolveCursor = config.resolveCursor;
  var edgeType = new GraphQLObjectType({
    name: name + 'Edge',
    description: 'An edge in a connection.',
    fields: function fields() {
      return Object.assign({
        node: {
          type: nodeType,
          resolve: resolveNode,
          description: 'The item at the end of the edge'
        },
        cursor: {
          type: new GraphQLNonNull(GraphQLString),
          resolve: resolveCursor,
          description: 'A cursor for use in pagination'
        }
      }, resolveMaybeThunk(edgeFields));
    }
  });

  var connectionType = new GraphQLObjectType({
    name: name + 'Connection',
    description: 'A connection to a list of items.',
    fields: function fields() {
      return Object.assign({
        pageInfo: {
          type: new GraphQLNonNull(pageInfoType),
          description: 'Information to aid in pagination.'
        },
        edges: {
          type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(edgeType))),
          description: 'A list of edges.'
        }
      }, resolveMaybeThunk(connectionFields));
    }
  });

  return {edgeType: edgeType, connectionType: connectionType};
}

/**
 * The common page info type used by all connections.
 */
var pageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  description: 'Information about pagination in a connection.',
  fields: function fields() {
    return {
      hasNextPage: {
        type: new GraphQLNonNull(GraphQLBoolean),
        description: 'When paginating forwards, are there more items?'
      },
      hasPreviousPage: {
        type: new GraphQLNonNull(GraphQLBoolean),
        description: 'When paginating backwards, are there more items?'
      },
      startCursor: {
        type: GraphQLString,
        description: 'When paginating backwards, the cursor to continue.'
      },
      endCursor: {
        type: GraphQLString,
        description: 'When paginating forwards, the cursor to continue.'
      }
    };
  }
});

exports.connectionDefinitions = connectionDefinitions;
