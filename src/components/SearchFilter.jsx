import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import 'react-select/dist/react-select.css';


class SearchFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    const { clearFilter } = this.props;
    if (nextProps.clearFilter !== clearFilter) {
      this.setState({
        selectedOption: ''
      });
    }
  }

  handleChange = (selectedOption) => {
    const { searchFilter } = this.props;
    this.setState({ selectedOption });
    if (selectedOption) {
      searchFilter(JSON.stringify(selectedOption));
    }
  }

  render() {
    const { selectedOption } = this.state;
    const { foundLocations } = this.props;

    return (
      <Select
        name="form-field-name"
        value={selectedOption}
        onChange={this.handleChange}
        options={foundLocations}
        multi
        placeholder="Filter by food items 😋"
      />
    );
  }
}

SearchFilter.propTypes = {
  foundLocations: PropTypes.arrayOf(PropTypes.object),
  searchFilter: PropTypes.func.isRequired,
  clearFilter: PropTypes.bool
};

SearchFilter.defaultProps = {
  foundLocations: [],
  clearFilter: false
};

export default SearchFilter;
