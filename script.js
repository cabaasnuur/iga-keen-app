:root {
  --black: #090909;
  --ink: #171717;
  --muted: #777;
  --line: #e8e8e8;
  --paper: #f5f5f5;
  --white: #fff;
  --radius: 20px;
  --shadow: 0 12px 35px #0000000c;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: #eaeaea;
  color: var(--ink);
  font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

button, input, select, textarea {
  font: inherit;
}

button, a {
  -webkit-tap-highlight-color: transparent;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

.app-shell {
  width: 100%;
  max-width: 520px;
  min-height: 100dvh;
  margin: auto;
  background: #fff;
  position: relative;
  padding-bottom: calc(84px + env(safe-area-inset-bottom));
  box-shadow: 0 0 50px #0000000a;
}

.topbar {
  height: 74px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 5;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -.6px;
}

.brand-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #090909;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 13px;
  letter-spacing: -.4px;
}

.brand small {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .1px;
  color: #888;
  margin-top: -2px;
}

.icon-button {
  width: 40px;
  height: 40px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: white;
  font-weight: 800;
  font-size: 18px;
}

.view {
  display: none;
  padding: 22px 18px 28px;
  animation: appear .22s ease;
}

.view.active {
  display: block;
}

@keyframes appear {
  from { opacity: .3; transform: translateY(5px); }
  to { opacity: 1; transform: none; }
}

.welcome-card {
  min-height: 220px;
  background: #0a0a0a;
  color: white;
  border-radius: 25px;
  padding: 23px 21px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.welcome-copy {
  position: relative;
  z-index: 1;
  max-width: 290px;
}

.eyebrow, .overline {
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 1.2px;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #dedede;
}

.eyebrow i {
  width: 7px;
  height: 7px;
  background: #fff;
  border-radius: 50%;
  display: inline-block;
}

.welcome-card h1 {
  font-size: 29px;
  line-height: 1.12;
  letter-spacing: -1.2px;
  margin: 15px 0 10px;
}

.welcome-card h1 span {
  display: block;
  color: #aaa;
}

.welcome-card p {
  color: #c7c7c7;
  font-size: 12px;
  line-height: 1.65;
  margin: 0 0 18px;
  max-width: 250px;
}

.welcome-mark {
  position: absolute;
  right: -22px;
  bottom: -45px;
  width: 160px;
  height: 160px;
  border: 1px solid #ffffff1b;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #ffffff0c;
  font-size: 55px;
  font-weight: 950;
}

.primary-button {
  min-height: 48px;
  border: 0;
  border-radius: 14px;
  padding: 0 17px;
  background: #090909;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 6px 15px #00000012;
}

.primary-button:disabled {
  opacity: .6;
  cursor: wait;
}

.welcome-card .primary-button {
  background: #fff;
  color: #090909;
  min-height: 43px;
}

.primary-button span {
  font-size: 18px;
}

.section-title {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin: 27px 2px 14px;
}

.overline {
  color: #888;
}

.section-title h2 {
  font-size: 18px;
  letter-spacing: -.5px;
  margin: 3px 0 0;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 11px;
}

.service-tile {
  min-height: 142px;
  text-align: left;
  border: 1px solid #e9e9e9;
  border-radius: 18px;
  background: #fff;
  padding: 15px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: transform .15s, border-color .15s;
}

.service-tile:active {
  transform: scale(.98);
}

.service-tile.selected {
  border-color: #151515;
  box-shadow: inset 0 0 0 1px #151515;
}

.tile-icon {
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  background: #f4f4f4;
  border-radius: 14px;
  font-size: 23px;
  margin-bottom: 10px;
}

.tile-name {
  font-weight: 850;
  font-size: 15px;
}

.tile-caption {
  font-size: 10px;
  color: #858585;
  margin-top: 2px;
}

.tile-arrow {
  position: absolute;
  right: 14px;
  top: 15px;
  color: #999;
  font-size: 17px;
}

.location-promo {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  margin-top: 17px;
  padding: 15px;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  background: #fafafa;
}

.promo-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  background: #111;
  color: #fff;
  border-radius: 13px;
  font-size: 23px;
}

.location-promo b, .location-promo small {
  display: block;
}

.location-promo b {
  font-size: 12px;
}

.location-promo small {
  font-size: 10px;
  color: #888;
  margin-top: 2px;
}

.promo-arrow {
  margin-left: auto;
  font-size: 20px;
}

.why-title {
  margin-top: 30px;
}

.how-list {
  display: grid;
  gap: 15px;
  margin-top: 17px;
}

.how-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.how-item > span {
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 12px;
  background: #111;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 12px;
}

.how-item b, .how-item small {
  display: block;
}

.how-item b {
  font-size: 12px;
}

.how-item small {
  font-size: 11px;
  color: #888;
  margin-top: 2px;
}

.bottom-nav {
  position: fixed;
  z-index: 10;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(100%, 520px);
  padding: 10px 15px calc(10px + env(safe-area-inset-bottom));
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: #fffffff2;
  backdrop-filter: blur(15px);
  border-top: 1px solid #ececec;
}

.nav-item {
  border: 0;
  background: transparent;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px;
}

.nav-item span {
  font-size: 22px;
  line-height: 1.15;
}

.nav-item small {
  font-size: 10px;
  font-weight: 700;
}

.nav-item.active {
  color: #090909;
}

.app-footer {
  text-align: center;
  font-size: 9px;
  color: #aaa;
  padding: 4px 10px 12px;
}

.back-button {
  border: 0;
  background: transparent;
  padding: 4px 0 18px;
  font-size: 12px;
  font-weight: 800;
  color: #555;
}

.page-heading {
  margin-bottom: 20px;
}

.page-heading h1 {
  font-size: 27px;
  letter-spacing: -1px;
  margin: 4px 0 6px;
}

.page-heading p {
  font-size: 12px;
  color: #858585;
  margin: 0;
}

.form-card, .contact-card, .success-card {
  border: 1px solid #ededed;
  border-radius: 21px;
  background: #fff;
  padding: 17px;
  box-shadow: var(--shadow);
}

.label {
  display: block;
  font-size: 11px;
  font-weight: 800;
  margin: 14px 0 7px;
}

.form-card > .label:first-child {
  margin-top: 0;
}

input, select, textarea {
  width: 100%;
  border: 1px solid #e4e4e4;
  border-radius: 12px;
  background: #fafafa;
  color: #171717;
  padding: 12px;
  font-size: 12px;
  outline: none;
  min-height: 45px;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

input:focus, select:focus, textarea:focus {
  border-color: #111;
  box-shadow: 0 0 0 3px #0000000b;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.input-group {
  min-width: 0;
}

.input-group input {
  min-width: 0;
}

.gps-button {
  margin-top: 9px;
  border: 1px solid #ddd;
  border-radius: 11px;
  background: white;
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
}

.gps-button span {
  font