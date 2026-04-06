import { Chip, Paper, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useRef, useState } from "react";
import { isArray, isString } from "lodash";
import toastError from "../../errors/toastError";
import api from "../../services/api";

export function TagsContainer({ contact }) {

    const [tags, setTags] = useState([]);
    const [selecteds, setSelecteds] = useState([]);
    const [loading, setLoading] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    useEffect(() => {
        if (isMounted.current) {
            loadTags();
        }
    }, [contact]);

    useEffect(() => {
        if (!Array.isArray(contact.tags) || contact.tags.length === 0) {
            setSelecteds([]);
            return;
        }

        if (!Array.isArray(tags) || tags.length === 0) {
            return;
        }

        const selectedTagIds = contact.tags.map(tag => tag.id);
        const matchedTags = tags.filter(tag => selectedTagIds.includes(tag.id));
        setSelecteds(matchedTags);
    }, [contact.tags, tags]);

    const createTag = async (data) => {
        try {
            const { data: responseData } = await api.post(`/tags`, data);
            return responseData;
        } catch (err) {
            toastError(err);
        }
    }

    const loadTags = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/tags/list`, 
            {params: { kanban: 0}
        });
            setTags(Array.isArray(data) ? data : []);
        } catch (err) {
            toastError(err);
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }

    const syncTags = async (data) => {
        try {
            const { data: responseData } = await api.post(`/tags/sync`, data);
            return responseData;
        } catch (err) {
            toastError(err);
        }
    }

    const onChange = async (value, reason) => {
        let optionsChanged = []
        if (reason === 'create-option') {
            if (isArray(value)) {
                for (let item of value) {
                    if (item.length < 3) {
                        toastError("Tag muito curta!");
                        return;
                    }
                    if (isString(item)) {
                        const newTag = await createTag({ name: item, kanban: 0, color: getRandomHexColor() })
                        optionsChanged.push(newTag);
                    } else {
                        optionsChanged.push(item);
                    }
                }
            }
            await loadTags();
        } else {
            optionsChanged = value;
        }
        setSelecteds(optionsChanged);
        await syncTags({ contactId: contact.id, tags: optionsChanged });
    }

    function getRandomHexColor() {
        // Gerar valores aleatórios para os componentes de cor
        const red = Math.floor(Math.random() * 256); // Valor entre 0 e 255
        const green = Math.floor(Math.random() * 256); // Valor entre 0 e 255
        const blue = Math.floor(Math.random() * 256); // Valor entre 0 e 255
      
        // Converter os componentes de cor em uma cor hexadecimal
        const hexColor = `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
      
        return hexColor;
    }

    return (
        <Paper style={{ padding: 2 }}>
            <Autocomplete
                multiple
                size="small"
                options={tags}
                value={selecteds}
                freeSolo
                openOnFocus
                disableCloseOnSelect
                disablePortal
                loading={loading}
                onChange={(e, v, r) => onChange(v, r)}
                onOpen={loadTags}
                getOptionLabel={(option) => isString(option) ? option : option?.name || ""}
                getOptionSelected={(option, value) => {
                    if (isString(option) || isString(value)) {
                        return option === value;
                    }
                    return option?.id === value?.id;
                }}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            variant="outlined"
                            style={{
                                backgroundColor: option.color || '#eee',
                                color: "#FFF",
                                marginRight: 1,
                                padding: 1,
                                fontWeight: 'bold',
                                paddingLeft: 5,
                                paddingRight: 5,
                                borderRadius: 3,
                                fontSize: "0.8em",
                                whiteSpace: "nowrap"
                            }}
                            label={option.name}
                            {...getTagProps({ index })}
                            size="small"
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" placeholder="Tags" />
                )}
                PaperComponent={({ children }) => (
                    <Paper
                        style={{ width: 400, marginLeft: 6, zIndex: 10010 }}
                    >
                        {children}
                    </Paper>
                )}
            />
        </Paper>
    )
}
