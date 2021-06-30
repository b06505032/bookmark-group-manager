import { Input, AutoComplete } from 'antd';
import { SelectOutlined } from '@ant-design/icons';

const SearchBar = ({account, groups, users, bookmarks, findUser, findGroups})=> {

    const search = (e) => {
        const { type, title } = e
        switch(type){
            case "user": {
                if (title === account.name){
                    findUser({variables:{name: title, type: "all"}})
                }
                else findUser({variables:{name: title, type: "public"}})
                break
            }
            case "group": {
                findGroups({variables:{name:title}})
                break
            }
            default:{}
        }
    }

    const handleClickDropdownItem = (e) => {
        search(e)
    }

    const handleClickEnter = (value) => {
        console.log(value)
        const titleType = value.split('@')
        const title = titleType[0]
        const type = titleType[1]
        search({type, title})
    }

    const renderTitle = (title) => (
        <span>
            {title} 
        </span>
    );
      
    const renderItem = (title, type) => ({
        value: `${title}@${type}`,
        label: (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                {title}
                <span>
                    <SelectOutlined onClick = {()=>{handleClickDropdownItem({type, title})}}/>
                </span>
            </div>
        ),
    });
      
    const options = [
        // {
        //     label: renderTitle('Bookmarks - fakedata'),
        //     options: bookmarks.map(item => renderItem(item, 'bookmark'))
        // },
        {
            label: renderTitle('Groups'),
            options: groups.map(item=> renderItem(item, 'group')),
        },
        {
            label: renderTitle('Users'),
            options: users.map(item=> renderItem(item, 'user')),
        },
    ];

    return (
        <AutoComplete
            dropdownClassName="certain-category-search-dropdown"
            dropdownMatchSelectWidth={200}
            style={{width: 250,}}
            options={options}
            filterOption={true}
        >
            <Input.Search size="middle" placeholder="Search Groups/Users" onSearch={handleClickEnter}/>
        </AutoComplete>
    )

}

export default SearchBar