import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Chip from "@material-ui/core/Chip";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(() => ({
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
}));

const UserWhatsAppSelect = ({ selectedWhatsappIds, onChange }) => {
  const classes = useStyles();
  const [whatsapps, setWhatsapps] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/whatsapp");
        setWhatsapps(data);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  return (
    <div style={{ marginTop: 6 }}>
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel>{i18n.t("userModal.form.whatsapps")}</InputLabel>
        <Select
          multiple
          value={selectedWhatsappIds}
          onChange={(e) => onChange(e.target.value)}
          renderValue={(selected) => (
            <div className={classes.chips}>
              {selected?.map((id) => {
                const whatsapp = whatsapps.find((item) => item.id === id);
                return whatsapp ? (
                  <Chip
                    key={id}
                    style={{ backgroundColor: whatsapp.color || "#f5f5f5" }}
                    label={whatsapp.name}
                    className={classes.chip}
                    variant="outlined"
                  />
                ) : null;
              })}
            </div>
          )}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            getContentAnchorEl: null,
          }}
        >
          {whatsapps.map((whatsapp) => (
            <MenuItem key={whatsapp.id} value={whatsapp.id}>
              {whatsapp.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default UserWhatsAppSelect;
