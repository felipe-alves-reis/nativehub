import React, {Component} from 'react';
import {ActivityIndicator} from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  ViewLoading,
} from './styles';

class User extends Component {
  static navigationOptions = ({navigation}) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    page: 1,
    refreshing: false,
  };

  async componentDidMount() {
    await this.getStars();
  }

  loadMore = async () => {
    await this.getStars();
  };

  handleRefresh = async () => {
    this.setState({refreshing: true, page: 1});

    await this.getStars();
  };

  getStars = async () => {
    const {navigation} = this.props;
    const {page, stars} = this.state;
    const user = navigation.getParam('user');

    this.setState({loading: true});

    const response = await api.get(`/users/${user.login}/starred?page=${page}`);

    this.setState({
      stars: [...stars, ...response.data],
      loading: false,
      page: page + 1,
      refreshing: false,
    });
  };

  render() {
    const {navigation} = this.props;
    const {stars, loading, refreshing} = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{uri: user.avatar}} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <ViewLoading>
            <ActivityIndicator color="#333" size="large" />
          </ViewLoading>
        ) : (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({item}) => (
              <Starred>
                <OwnerAvatar source={{uri: item.owner.avatar_url}} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
            onEndReached={this.loadMore}
            onEndReachedThreshold={0.2}
            onRefresh={this.handleRefresh}
            refreshing={refreshing}
          />
        )}
      </Container>
    );
  }
}

export default User;
