import React, { useState } from 'react';
import { Input, Popover, AutoComplete } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const SearchBarWithPopover = () => {
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearchChange = (value: string) => {
        setSearchText(value);

        // Simulate fetching data based on search input
        // You can replace this with an API call or other data fetching logic
        if (value) {
            setSearchResults(
                ['Apple', 'Banana', 'Cherry', 'Date', 'Grapes', 'Lemon', 'Orange', 'Pineapple']
                    .filter(item => item.toLowerCase().includes(value.toLowerCase()))
            );
        } else {
            setSearchResults([]);
        }
    };

    // Popover content
    const content = (
        <div>
            {searchResults.length > 0 ? (
                searchResults.map((item, index) => <div key={index}>{item}</div>)
            ) : (
                <div>No results found</div>
            )}
        </div>
    );

    return (
        <div style={{ maxWidth: 400, minWidth: 200}}>
            <Popover
                content={content}
                title="Search Results"
                trigger="focus" // Trigger on focus (or change trigger as needed)
                visible={searchText.length > 0 && searchResults.length > 0} // Show only if there are results
            >
                <AutoComplete
                    style={{ width: '100%', }}
                    className="no-border"
                    onSearch={handleSearchChange}
                    onChange={handleSearchChange}
                    value={searchText}
                    placeholder="Search..."
                // suffix={<SearchOutlined />}
                />

            </Popover>
        </div>
    );
};

export default SearchBarWithPopover;
