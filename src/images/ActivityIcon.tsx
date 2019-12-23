import React from 'react';
import Svg, {Path} from 'react-native-svg';

const ActivityIcon = (props: any) => (
  <Svg width={131.238} height={131.238} viewBox="0 0 34.723 34.723" {...props}>
    <Path
      fill="#1fdb1f"
      d="M34.37 17.362A17.009 17.009 0 0117.42 34.37 17.009 17.009 0 01.353 17.476 17.009 17.009 0 0117.19.354a17.009 17.009 0 0117.18 16.78"
    />
    <Path
      d="M3.252 18.721h5.67l3.329-5.766 3.222 12.027 4.872-18.183 4.03 15.04 2.103-3.641h5.406l-.19.051"
      stroke="#44932d"
      fill="none"
      strokeWidth={2.165}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ActivityIcon;
